"""
MemoryDesk — AI Sales & Customer Intelligence Agent
FastAPI Backend with Hindsight Memory + Groq LLM
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from groq import Groq
from hindsight_client import Hindsight
from datetime import datetime

# ─────────────────────────────────────────────
# CONFIG — Your API Keys
# ─────────────────────────────────────────────
GROQ_API_KEY = "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"
HINDSIGHT_ENDPOINT = "https://api.hindsight.vectorize.io"


HINDSIGHT_API_KEY = "hsk_302f0df2c11bb5c071f5a7d521be04cd_0c7765cc5eb5d1e7"

# ─────────────────────────────────────────────
# CLIENTS
# ─────────────────────────────────────────────
groq_client = Groq(api_key=GROQ_API_KEY)
hindsight = Hindsight(HINDSIGHT_ENDPOINT, HINDSIGHT_API_KEY)

# ─────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(title="MemoryDesk API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set to your Lovable frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# REQUEST / RESPONSE MODELS
# ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    customer_id: str           # e.g. "john-chen-amex"
    customer_name: str         # e.g. "John Chen"
    message: str               # The sales rep's message
    session_id: Optional[str] = None

class RetainRequest(BaseModel):
    customer_id: str
    content: str               # What happened in this interaction
    tags: Optional[list[str]] = None

class RecallRequest(BaseModel):
    customer_id: str
    query: str

class ReflectRequest(BaseModel):
    customer_id: str
    query: str                 # e.g. "Summarise this customer overall"

class SetupCustomerRequest(BaseModel):
    customer_id: str
    customer_name: str
    company: str
    role: str

# ─────────────────────────────────────────────
# HELPER — Get or Create Memory Bank per Customer
# ─────────────────────────────────────────────
def ensure_bank(customer_id: str, customer_name: str = "", company: str = ""):
    """Creates a Hindsight memory bank for a customer if it doesn't exist."""
    try:
        hindsight.create_bank(
            bank_id=customer_id,
            name=f"Customer: {customer_name} ({company})",
            mission=(
                f"I am a customer intelligence agent tracking {customer_name} from {company}. "
                "I remember every sales interaction, objection, preference, deal stage, and outcome. "
                "I help sales reps prepare for calls and never let them walk in blind."
            ),
        )
    except Exception:
        # Bank already exists — that's fine
        pass

# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "MemoryDesk API is running 🧠", "version": "1.0.0"}


@app.post("/setup-customer")
def setup_customer(req: SetupCustomerRequest):
    """
    Creates a memory bank for a new customer.
    Call this when a customer is first added to MemoryDesk.
    """
    ensure_bank(req.customer_id, req.customer_name, req.company)
    return {
        "success": True,
        "message": f"Memory bank created for {req.customer_name}",
        "customer_id": req.customer_id,
    }


@app.post("/chat")
def chat(req: ChatRequest):
    """
    Main chat endpoint.
    1. recall() — fetch relevant memories about this customer
    2. Build prompt with memories as context
    3. Call Groq LLM for response
    4. retain() — save this interaction to memory
    """
    ensure_bank(req.customer_id, req.customer_name)

    # STEP 1 — recall memories relevant to the query
    recalled_text = ""
    recalled_memories = []
    try:
        recall_result = hindsight.recall(
            bank_id=req.customer_id,
            query=req.message,
            max_tokens=2000,
            budget="mid",
        )
        recalled_text = str(recall_result) if recall_result else ""
        # Try to extract individual memory items for the frontend
        try:
            if hasattr(recall_result, '__iter__'):
                for item in recall_result:
                    recalled_memories.append(str(item))
        except Exception:
            pass
    except Exception as e:
        recalled_text = ""
        print(f"Recall error (non-fatal): {e}")

    # STEP 2 — build prompt with memory context
    system_prompt = f"""You are MemoryDesk, an AI Sales & Customer Intelligence Agent.

You have the following memory about customer {req.customer_name}:
---
{recalled_text if recalled_text else "No prior history found. This appears to be the first interaction."}
---

Your job:
- Help the sales rep prepare for calls, log outcomes, understand patterns
- Reference specific past interactions when relevant
- Be concise, actionable, and professional
- If you have memory about this customer, use it actively
- If no memory exists, acknowledge it's a fresh start

Today's date: {datetime.now().strftime("%B %d, %Y")}
Customer: {req.customer_name}
"""

    # STEP 3 — call Groq LLM
    try:
        completion = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message},
            ],
            temperature=0.7,
            max_tokens=800,
        )
        ai_response = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    # STEP 4 — retain this interaction to memory
    try:
        hindsight.retain(
            bank_id=req.customer_id,
            content=(
                f"Sales rep asked: {req.message}\n"
                f"Agent responded with: {ai_response}\n"
                f"Interaction date: {datetime.now().isoformat()}"
            ),
            tags=["chat", "sales-interaction"],
        )
    except Exception as e:
        print(f"Retain error (non-fatal): {e}")

    return {
        "response": ai_response,
        "memories_used": recalled_memories,
        "memory_context_length": len(recalled_text),
        "customer_id": req.customer_id,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/retain")
def retain_memory(req: RetainRequest):
    """
    Manually store a memory about a customer.
    Use this to log call outcomes, deals closed, issues resolved, etc.
    """
    ensure_bank(req.customer_id)
    try:
        result = hindsight.retain(
            bank_id=req.customer_id,
            content=req.content,
            tags=req.tags or ["manual-log"],
        )
        return {
            "success": True,
            "message": "Memory stored successfully",
            "customer_id": req.customer_id,
            "content_preview": req.content[:100] + "..." if len(req.content) > 100 else req.content,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retain error: {str(e)}")


@app.post("/recall")
def recall_memory(req: RecallRequest):
    """
    Retrieve memories about a customer relevant to a query.
    """
    try:
        result = hindsight.recall(
            bank_id=req.customer_id,
            query=req.query,
            max_tokens=3000,
            budget="high",
        )
        return {
            "memories": str(result),
            "customer_id": req.customer_id,
            "query": req.query,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recall error: {str(e)}")


@app.post("/reflect")
def reflect_on_customer(req: ReflectRequest):
    """
    Deep reasoning about a customer using reflect().
    Use for: 'How is this customer doing?', 'Summarise John', 'Why does billing keep failing?'
    """
    try:
        result = hindsight.reflect(
            bank_id=req.customer_id,
            query=req.query,
            budget="mid",
        )
        reflected_answer = str(result) if result else "Not enough history to reflect on yet."

        # Also run through Groq for a polished response
        completion = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "You are a customer intelligence analyst. Format the following memory reflection into a clean, actionable summary with bullet points. Be concise and professional.",
                },
                {
                    "role": "user",
                    "content": f"Reflection query: {req.query}\n\nRaw reflection data:\n{reflected_answer}",
                },
            ],
            temperature=0.5,
            max_tokens=600,
        )
        polished = completion.choices[0].message.content

        return {
            "reflection": polished,
            "raw_reflection": reflected_answer,
            "customer_id": req.customer_id,
            "query": req.query,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reflect error: {str(e)}")


@app.post("/brief")
def get_call_brief(req: RecallRequest):
    """
    Get a pre-call briefing for a customer — the 'money shot' of MemoryDesk.
    Recalls everything relevant and formats it as a briefing card.
    """
    ensure_bank(req.customer_id)

    # recall everything about this customer
    recalled_text = ""
    try:
        result = hindsight.recall(
            bank_id=req.customer_id,
            query=f"Everything about this customer: past calls, objections, preferences, deal stage",
            max_tokens=3000,
            budget="high",
        )
        recalled_text = str(result) if result else ""
    except Exception as e:
        recalled_text = ""
        print(f"Recall error: {e}")

    # Format as briefing card via Groq
    try:
        completion = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "system",
                    "content": """You are a sales intelligence briefing system.
Format the customer memory into a clean pre-call briefing with these sections:
🎯 Deal Status
⚠️ Key Objections / Watch-outs  
✅ What Has Worked
💬 Communication Preferences
🔁 Recommended Next Steps

Be specific, bullet-pointed, and max 250 words total.""",
                },
                {
                    "role": "user",
                    "content": f"Customer: {req.query}\n\nMemory data:\n{recalled_text if recalled_text else 'No prior history. This is the first interaction.'}",
                },
            ],
            temperature=0.5,
            max_tokens=500,
        )
        briefing = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brief generation error: {str(e)}")

    return {
        "briefing": briefing,
        "memory_found": bool(recalled_text),
        "customer_id": req.customer_id,
        "generated_at": datetime.now().isoformat(),
    }


@app.get("/customers")
def list_customers():
    """
    Returns the hardcoded list of demo customers.
    In production, this would come from your database.
    """
    return {
        "customers": DEMO_CUSTOMERS
    }


# ─────────────────────────────────────────────
# DEMO CUSTOMERS (Synthetic Data)
# ─────────────────────────────────────────────
DEMO_CUSTOMERS = [
    {
        "id": "john-chen-amex",
        "name": "John Chen",
        "company": "American Express",
        "role": "VP of Digital Partnerships",
        "deal_value": "$250,000",
        "stage": "Proposal",
        "avatar": "JC",
    },
    {
        "id": "sarah-malik-salesforce",
        "name": "Sarah Malik",
        "company": "Salesforce",
        "role": "Director of Enterprise Sales",
        "deal_value": "$180,000",
        "stage": "Negotiation",
        "avatar": "SM",
    },
    {
        "id": "raj-patel-stripe",
        "name": "Raj Patel",
        "company": "Stripe",
        "role": "Head of Partnerships",
        "deal_value": "$95,000",
        "stage": "Discovery",
        "avatar": "RP",
    },
    {
        "id": "emily-torres-notion",
        "name": "Emily Torres",
        "company": "Notion",
        "role": "Chief Revenue Officer",
        "deal_value": "$320,000",
        "stage": "Closed Won",
        "avatar": "ET",
    },
    {
        "id": "david-kim-openai",
        "name": "David Kim",
        "company": "OpenAI",
        "role": "Enterprise Account Manager",
        "deal_value": "$500,000",
        "stage": "Qualification",
        "avatar": "DK",
    },
]

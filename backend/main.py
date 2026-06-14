# backend/main.py
"""
MemoryDesk — AI Sales & Customer Intelligence Agent
FastAPI Backend with Hindsight Memory + Groq LLM
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import aiohttp
from groq import Groq
from datetime import datetime

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
GROQ_API_KEY = "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"
HINDSIGHT_ENDPOINT = "https://api.hindsight.vectorize.io"
HINDSIGHT_API_KEY = "hsk_302f0df2c11bb5c071f5a7d521be04cd_0c7765cc5eb5d1e7"

HINDSIGHT_HEADERS = {
    "Authorization": f"Bearer {HINDSIGHT_API_KEY}",
    "Content-Type": "application/json",
}

# ─────────────────────────────────────────────
# CLIENTS
# ─────────────────────────────────────────────
groq_client = Groq(api_key=GROQ_API_KEY)

# ─────────────────────────────────────────────
# HINDSIGHT HELPERS (Direct Async HTTP)
# ─────────────────────────────────────────────
async def _create_bank(bank_id: str, name: str, background: str = ""):
    async with aiohttp.ClientSession() as session:
        url = f"{HINDSIGHT_ENDPOINT}/v1/default/banks/{bank_id}"
        payload = {"name": name, "background": background}
        async with session.put(url, json=payload, headers=HINDSIGHT_HEADERS) as resp:
            return resp.status


async def _retain(bank_id: str, content: str):
    async with aiohttp.ClientSession() as session:
        url = f"{HINDSIGHT_ENDPOINT}/v1/default/banks/{bank_id}/memories"
        payload = {"items": [{"content": content}]}
        async with session.post(url, json=payload, headers=HINDSIGHT_HEADERS) as resp:
            return await resp.json()


async def _recall(bank_id: str, query: str, max_tokens: int = 2000):
    async with aiohttp.ClientSession() as session:
        url = f"{HINDSIGHT_ENDPOINT}/v1/default/banks/{bank_id}/memories/recall"
        payload = {"query": query, "max_tokens": max_tokens, "budget": "mid"}
        async with session.post(url, json=payload, headers=HINDSIGHT_HEADERS) as resp:
            if resp.status == 200:
                data = await resp.json()
                print(f"RECALL RESPONSE: {data}")
                return data
            else:
                text = await resp.text()
                print(f"RECALL ERROR {resp.status}: {text}")
                return {}


async def _reflect(bank_id: str, query: str):
    async with aiohttp.ClientSession() as session:
        url = f"{HINDSIGHT_ENDPOINT}/v1/default/banks/{bank_id}/reflect"
        payload = {"query": query, "budget": "mid"}
        async with session.post(url, json=payload, headers=HINDSIGHT_HEADERS) as resp:
            if resp.status == 200:
                data = await resp.json()
                print(f"REFLECT RESPONSE: {data}")
                return data
            else:
                text = await resp.text()
                print(f"REFLECT ERROR {resp.status}: {text}")
                return {}


# ─────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(title="MemoryDesk API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    customer_id: str
    customer_name: str
    message: str
    session_id: Optional[str] = None

class RetainRequest(BaseModel):
    customer_id: str
    content: str
    tags: Optional[list[str]] = None

class RecallRequest(BaseModel):
    customer_id: str
    query: str

class ReflectRequest(BaseModel):
    customer_id: str
    query: str

class SetupCustomerRequest(BaseModel):
    customer_id: str
    customer_name: str
    company: str
    role: str

# ─────────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────────
async def ensure_bank(customer_id: str, customer_name: str = "", company: str = ""):
    try:
        await _create_bank(
            bank_id=customer_id,
            name=f"Customer: {customer_name} ({company})",
            background=(
                f"I am a customer intelligence agent tracking {customer_name} from {company}. "
                "I remember every sales interaction, objection, preference, deal stage, and outcome."
            ),
        )
    except Exception:
        pass

# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "MemoryDesk API is running 🧠", "version": "1.0.0"}


@app.post("/setup-customer")
async def setup_customer(req: SetupCustomerRequest):
    await ensure_bank(req.customer_id, req.customer_name, req.company)
    return {"success": True, "message": f"Memory bank created for {req.customer_name}", "customer_id": req.customer_id}


@app.post("/chat")
async def chat(req: ChatRequest):
    await ensure_bank(req.customer_id, req.customer_name)

    # STEP 1 — recall memories
    recalled_text = ""
    memories_count = 0
    try:
        recall_result = await _recall(req.customer_id, req.message)
        if recall_result:
            if "results" in recall_result:
                results = recall_result["results"]
                memories_count = len(results)
                recalled_text = "\n".join([r.get("text", "") for r in results if r.get("text")])
            elif "memories" in recall_result:
                memories_count = len(recall_result["memories"]) if isinstance(recall_result["memories"], list) else 1
                recalled_text = str(recall_result["memories"])
            elif "facts" in recall_result:
                facts = recall_result["facts"]
                memories_count = len(facts)
                recalled_text = "\n".join([f.get("text", "") or f.get("content", "") for f in facts])
            else:
                memories_count = 1
                recalled_text = str(recall_result)
    except Exception as e:
        print(f"Recall error (non-fatal): {e}")

    # STEP 2 — build prompt
    system_prompt = f"""You are MemoryDesk, an AI Sales & Customer Intelligence Agent.

You have the following memory about customer {req.customer_name}:
---
{recalled_text if recalled_text else "No prior history found. This appears to be the first interaction."}
---

Your job:
- Help the sales rep prepare for calls, log outcomes, understand patterns
- Reference specific past interactions when relevant
- Be concise, actionable, and professional

Today's date: {datetime.now().strftime("%B %d, %Y")}
Customer: {req.customer_name}
"""

    # STEP 3 — call Groq LLM
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
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

    # STEP 4 — retain this interaction
    try:
        await _retain(
            req.customer_id,
            f"Sales rep asked: {req.message}\nAgent responded: {ai_response}\nDate: {datetime.now().isoformat()}"
        )
    except Exception as e:
        print(f"Retain error (non-fatal): {e}")

    return {
        "response": ai_response,
        "memories_used": memories_count,  # Fixed type mismatch to pass back an explicit number
        "memory_context_length": len(recalled_text),
        "customer_id": req.customer_id,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/retain")
async def retain_memory(req: RetainRequest):
    await ensure_bank(req.customer_id)
    try:
        await _retain(req.customer_id, req.content)
        return {
            "success": True,
            "message": "Memory stored successfully",
            "customer_id": req.customer_id,
            "content_preview": req.content[:100] + "..." if len(req.content) > 100 else req.content,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retain error: {str(e)}")


@app.post("/recall")
async def recall_memory(req: RecallRequest):
    try:
        result = await _recall(req.customer_id, req.query, max_tokens=3000)
        return {"memories": result, "customer_id": req.customer_id, "query": req.query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recall error: {str(e)}")


@app.post("/reflect")
async def reflect_on_customer(req: ReflectRequest):
    try:
        result = await _reflect(req.customer_id, req.query)
        reflected_answer = result.get("answer", "") or result.get("response", "") or str(result)

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a customer intelligence analyst. Format the following memory reflection into a clean, actionable summary with bullet points. Be concise and professional."},
                {"role": "user", "content": f"Reflection query: {req.query}\n\nRaw reflection data:\n{reflected_answer}"},
            ],
            temperature=0.5,
            max_tokens=600,
        )
        return {
            "reflection": completion.choices[0].message.content,
            "raw_reflection": reflected_answer,
            "customer_id": req.customer_id,
            "query": req.query,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reflect error: {str(e)}")


@app.post("/brief")
async def get_call_brief(req: RecallRequest):
    await ensure_bank(req.customer_id)
    recalled_text = ""
    try:
        result = await _recall(req.customer_id, "Everything about this customer: past calls, objections, preferences, deal stage", max_tokens=3000)
        if "results" in result:
            recalled_text = "\n".join([r.get("text", "") for r in result["results"] if r.get("text")])
        elif "facts" in result:
            recalled_text = "\n".join([f.get("text", "") or f.get("content", "") for f in result["facts"]])
        else:
            recalled_text = str(result)
    except Exception as e:
        print(f"Recall error: {e}")

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": """You are a sales intelligence briefing system.
Format the customer memory into a clean pre-call briefing with these sections:
🎯 Deal Status
⚠️ Key Objections / Watch-outs
✅ What Has Worked
💬 Communication Preferences
🔁 Recommended Next Steps
Be specific, bullet-pointed, and max 250 words total."""},
                {"role": "user", "content": f"Customer: {req.query}\n\nMemory data:\n{recalled_text if recalled_text else 'No prior history.'}"},
            ],
            temperature=0.5,
            max_tokens=500,
        )
        return {
            "briefing": completion.choices[0].message.content,
            "memory_found": bool(recalled_text),
            "customer_id": req.customer_id,
            "generated_at": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brief generation error: {str(e)}")


# ─────────────────────────────────────────────
# NEW CONNECTIVITY ENDPOINTS FOR FRONTEND 
# ─────────────────────────────────────────────

@app.get("/customers")
def list_customers():
    return {"customers": DEMO_CUSTOMERS}


@app.get("/memories/{customer_id}")
async def get_customer_memories_timeline(customer_id: str):
    """Prevents frontend 404 errors when opening profiles by pulling history data"""
    try:
        result = await _recall(customer_id, "All timeline interactions logs profile notes history", max_tokens=1500)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/messages/{customer_id}")
async def get_customer_messages_history(customer_id: str):
    """Prevents frontend 404 errors by serving initial chat welcome blocks"""
    return [
        {
            "id": f"init_{customer_id}",
            "role": "agent",
            "content": f"Connected live to vector intelligence core. I have initialized active tracking filters for this profile. Ask me any history data or generate a pre-call briefing.",
            "timestamp": "Just now",
            "memoriesUsed": 0
        }
    ]


# ─────────────────────────────────────────────
# DEMO CUSTOMERS
# ─────────────────────────────────────────────
DEMO_CUSTOMERS = [
    {"id": "john-chen-amex", "name": "John Chen", "company": "American Express", "role": "VP of Digital Partnerships", "deal_value": "$250,000", "stage": "Proposal", "avatar": "JC"},
    {"id": "sarah-malik-salesforce", "name": "Sarah Malik", "company": "Salesforce", "role": "Director of Enterprise Sales", "deal_value": "$180,000", "stage": "Negotiation", "avatar": "SM"},
    {"id": "raj-patel-stripe", "name": "Raj Patel", "company": "Stripe", "role": "Head of Partnerships", "deal_value": "$95,000", "stage": "Discovery", "avatar": "RP"},
    {"id": "emily-torres-notion", "name": "Emily Torres", "company": "Notion", "role": "Chief Revenue Officer", "deal_value": "$320,000", "stage": "Closed Won", "avatar": "ET"},
    {"id": "david-kim-openai", "name": "David Kim", "company": "OpenAI", "role": "Enterprise Account Manager", "deal_value": "$500,000", "stage": "Qualification", "avatar": "DK"},
]
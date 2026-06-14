# backend/main.py
"""
MemoryDesk — Complete Stateful Backend Engine
FastAPI Core + Hindsight Vector Memory Banks + Groq LLM Inference
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import aiohttp
from groq import Groq
from datetime import datetime

# ─────────────────────────────────────────────
# SECURITY CONFIGURATION (LIVE CHANNELS)
# ─────────────────────────────────────────────
GROQ_API_KEY = "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"
HINDSIGHT_ENDPOINT = "https://api.hindsight.vectorize.io"
HINDSIGHT_API_KEY = "hsk_302f0df2c11bb5c071f5a7d521be04cd_0c7765cc5eb5d1e7"

HINDSIGHT_HEADERS = {
    "Authorization": f"Bearer {HINDSIGHT_API_KEY}",
    "Content-Type": "application/json",
}

# ─────────────────────────────────────────────
# INFERENCE CLIENT & VOLATILE RUNTIME STATE DB
# ─────────────────────────────────────────────
groq_client = Groq(api_key=GROQ_API_KEY)

# Stateful list allowing dynamic creation mutations from the frontend UI forms
LIVE_CUSTOMERS = [
    {"id": "john-chen-amex", "name": "John Chen", "company": "American Express", "role": "VP of Digital Partnerships", "deal_value": "$250,000", "stage": "Proposal", "avatar": "JC"},
    {"id": "sarah-malik-salesforce", "name": "Sarah Malik", "company": "Salesforce", "role": "Director of Enterprise Sales", "deal_value": "$180,000", "stage": "Negotiation", "avatar": "SM"},
    {"id": "raj-patel-stripe", "name": "Raj Patel", "company": "Stripe", "role": "Head of Partnerships", "deal_value": "$95,000", "stage": "Discovery", "avatar": "RP"},
    {"id": "emily-torres-notion", "name": "Emily Torres", "company": "Notion", "role": "Chief Revenue Officer", "deal_value": "$320,000", "stage": "Closed Won", "avatar": "ET"},
    {"id": "david-kim-openai", "name": "David Kim", "company": "OpenAI", "role": "Enterprise Account Manager", "deal_value": "$500,000", "stage": "Qualification", "avatar": "DK"},
]

# ─────────────────────────────────────────────
# DIRECT ASYNC VECTOR ENGINE ROUTINES
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
                return await resp.json()
            return {}

# ─────────────────────────────────────────────
# APPLICATION INSTANTIATION & MIDDLEWARE
# ─────────────────────────────────────────────
app = FastAPI(title="MemoryDesk Production Server", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# DATA TRANSMISSION VALIDATION LAYERS (PYDANTIC)
# ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    customer_id: str
    customer_name: str
    message: str

class RetainRequest(BaseModel):
    customer_id: str
    content: str

class RecallRequest(BaseModel):
    customer_id: str
    query: str

class ReflectRequest(BaseModel):
    customer_id: str
    query: str

class AddCustomerRequest(BaseModel):
    name: str
    company: str
    role: str
    deal_value: str
    stage: str

class UpdateStageRequest(BaseModel):
    customer_id: str
    stage: str

# ─────────────────────────────────────────────
# ATOMIC SUBSURFACE HELPERS
# ─────────────────────────────────────────────
async def ensure_bank(customer_id: str, customer_name: str = "", company: str = ""):
    try:
        await _create_bank(
            bank_id=customer_id,
            name=f"Customer: {customer_name} ({company})",
            background=f"Account tracking logs profile folder container for {customer_name} at {company}."
        )
    except Exception:
        pass

# ─────────────────────────────────────────────
# NATIVE RESTful CONTROL ROUTE ENTRYPOINTS
# ─────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "MemoryDesk Engine Active 🧠", "connected_records": len(LIVE_CUSTOMERS)}


@app.get("/customers")
def list_customers_live():
    """Powers active sidebars lists and customer grids instantly from memory storage state"""
    return LIVE_CUSTOMERS


@app.post("/customers")
async def create_customer_live(req: AddCustomerRequest):
    """Fulfills execution actions of the 'Add Customer' input form module"""
    slug_id = f"{req.name.lower().replace(' ', '-')}-{req.company.lower().replace(' ', '-')}"
    
    if any(c["id"] == slug_id for c in LIVE_CUSTOMERS):
        raise HTTPException(status_code=400, detail="A customer profile matching that exact namespace mapping index row is already logged.")
        
    avatar_string = "".join([part[0].upper() for part in req.name.split() if part])[:2]
    
    new_profile = {
        "id": slug_id,
        "name": req.name,
        "company": req.company,
        "role": req.role,
        "deal_value": req.deal_value if req.deal_value.startswith("$") else f"${req.deal_value}",
        "stage": req.stage,
        "avatar": avatar_string if avatar_string else "CU"
    }
    
    LIVE_CUSTOMERS.append(new_profile)
    await ensure_bank(slug_id, req.name, req.company)
    
    try:
        await _retain(slug_id, f"Profile initialized onto master tracking boards on {datetime.now().strftime('%B %d, %Y')}. Est Value: {req.deal_value}. Step Stage: {req.stage}.")
    except Exception:
        pass
        
    return {"success": True, "customer": new_profile}


@app.post("/customers/update-stage")
async def mutate_customer_deal_stage(req: UpdateStageRequest):
    """Saves deal layout status changes instantly from layout menu modification events"""
    for customer in LIVE_CUSTOMERS:
        if customer["id"] == req.customer_id:
            old_stage = customer["stage"]
            customer["stage"] = req.stage
            try:
                await _retain(req.customer_id, f"Internal pipeline lifecycle state shift adjustment: Moved from '{old_stage}' status bracket down to context tier state alignment definition '{req.stage}'.")
            except Exception:
                pass
            return {"success": True, "customer": customer}
            
    raise HTTPException(status_code=404, detail="Target tracking allocation vector reference identification mapping pointer key row item entry macro context not found.")


@app.get("/insights/stats")
def evaluate_pipeline_aggregate_analytics():
    """Computes total pipeline valuations and status category distribution splits on demand for graphing tools"""
    total_pipeline_value = 0
    stage_distribution = {}
    
    for c in LIVE_CUSTOMERS:
        try:
            val = int(c["deal_value"].replace("$", "").replace(",", "").strip())
            total_pipeline_value += val
        except ValueError:
            pass
        stage_distribution[c["stage"]] = stage_distribution.get(c["stage"], 0) + 1
        
    return {
        "total_deals_monitored": len(LIVE_CUSTOMERS),
        "aggregate_estimated_pipeline": f"${total_pipeline_value:,}",
        "metrics_distribution": stage_distribution
    }


@app.post("/chat")
async def process_conversational_turn(req: ChatRequest):
    """Processes chat query, pulls context arrays, and saves response strings back to database vector indexes"""
    await ensure_bank(req.customer_id, req.customer_name)

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
    except Exception as e:
        print(f"Recall engine error: {e}")

    system_prompt = f"""You are MemoryDesk, an elite AI Customer Intelligence Co-Pilot Agent.
Synthesize the historical profile memory information files regarding customer {req.customer_name}:
---
{recalled_text if recalled_text else "No interaction record tracking data history entry rows yet recorded."}
---
Formulate high-level strategic responses based strictly on the factual records extracted above."""

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
        raise HTTPException(status_code=500, detail=f"LLM tracking loop generation fault: {str(e)}")

    try:
        await _retain(req.customer_id, f"Rep query string input context token: '{req.message}' \nSystem generated co-pilot directive statement: '{ai_response}'")
    except Exception:
        pass

    return {
        "response": ai_response,
        "memories_used": memories_count,
        "customer_id": req.customer_id,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/retain")
async def create_custom_discrete_memory_log(req: RetainRequest):
    await ensure_bank(req.customer_id)
    try:
        await _retain(req.customer_id, req.content)
        return {"success": True, "customer_id": req.customer_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recall")
async def return_raw_vector_matches(req: RecallRequest):
    try:
        result = await _recall(req.customer_id, req.query, max_tokens=2500)
        return {"memories": result, "customer_id": req.customer_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reflect")
async def reflect_on_customer(req: ReflectRequest):
    try:
        result = await _recall(req.customer_id, req.query, max_tokens=1500)
        raw_rows = str(result)
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a customer intelligence analyst. Format reflection data parameters elements row text items into clean bullets."},
                {"role": "user", "content": f"Query logic string: {req.query}\n\nDataset content inputs:\n{raw_rows}"},
            ],
            temperature=0.5,
            max_tokens=500,
        )
        return {"reflection": completion.choices[0].message.content, "customer_id": req.customer_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/brief")
async def compute_call_briefing_cards(req: RecallRequest):
    """Compiles five-tier executive structured analysis briefs using retrieved workspace rows"""
    await ensure_bank(req.customer_id)
    recalled_text = ""
    try:
        result = await _recall(req.customer_id, "Summarize all history objections records parameters deal value status", max_tokens=3000)
        if "results" in result:
            recalled_text = "\n".join([r.get("text", "") for r in result["results"] if r.get("text")])
        elif "facts" in result:
            recalled_text = "\n".join([f.get("text", "") or f.get("content", "") for f in result["facts"]])
    except Exception:
        pass

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": """You are an AI sales brief system. Synthesize context data into exactly these headings:
🎯 Deal Status
⚠️ Key Objections / Watch-outs
✅ What Has Worked
💬 Communication Preferences
🔁 Recommended Next Steps
Keep content tightly actionable, highly specific to known profile text details and max 250 words total."""},
                {"role": "user", "content": f"Customer contextual details baseline:\n{recalled_text if recalled_text else 'No historical records logged.'}"},
            ],
            temperature=0.5,
            max_tokens=600,
        )
        return {"briefing": completion.choices[0].message.content, "customer_id": req.customer_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/memories/{customer_id}")
async def get_customer_memories_timeline(customer_id: str):
    """Handles automatic timeline tracking component queries on folder profile select clicks"""
    try:
        result = await _recall(customer_id, "All stored interaction logs historical profiles transaction milestones text records values", max_tokens=1500)
        return result
    except Exception:
        return {"results": []}


@app.get("/messages/{customer_id}")
async def get_customer_messages_history(customer_id: str):
    """Handles chat stream welcome panel message loads on system entry"""
    return [
        {
            "id": f"init_{customer_id}",
            "role": "agent",
            "content": "Live memory synchronization complete. Ask me any context metrics about this customer profile or compile an instantaneous briefing.",
            "timestamp": "Just now",
            "memoriesUsed": 0
        }
    ]
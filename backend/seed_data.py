"""
MemoryDesk — Synthetic Data Seeder
Run this ONCE to populate Hindsight with realistic customer history.
This makes your demo look impressive — agents that already know customers!

Usage: python seed_data.py
"""

from hindsight_client import Hindsight
import time

HINDSIGHT_ENDPOINT = "https://api.hindsight.vectorize.io"
HINDSIGHT_API_KEY = "hsk_f029ea01adf71a82a4ef28d0638b541b_baea9b5ee371c27a"

hindsight = Hindsight(HINDSIGHT_ENDPOINT, HINDSIGHT_API_KEY)

# ─────────────────────────────────────────────
# SYNTHETIC CUSTOMER HISTORIES
# ─────────────────────────────────────────────
CUSTOMER_DATA = [
    {
        "bank_id": "john-chen-amex",
        "name": "John Chen",
        "company": "American Express",
        "mission": "Tracking John Chen, VP of Digital Partnerships at American Express. He is evaluating our platform for enterprise deployment across AmEx's customer service division.",
        "history": [
            "First call on March 15 2026. John was interested but asked pointed questions about data residency and GDPR compliance. He mentioned they had a bad experience with a previous vendor who leaked customer data. Deal value discussed: $250,000 annual contract.",
            "Follow-up demo on March 28 2026. John brought his security team lead, Priya Nair. Priya asked about SOC2 Type II certification and penetration test reports. John seemed impressed with the UI but Priya raised concerns about API rate limits.",
            "John sent email on April 5 2026 saying he preferred async follow-ups over calls. He mentioned he is extremely busy with AmEx's Q2 planning cycle and prefers detailed written summaries after each meeting.",
            "Pricing call on April 22 2026. John pushed back hard on the $250k price — said he had a competing offer from a rival vendor at $190k. He mentioned the competing vendor offered unlimited API calls. John's budget approval needs sign-off from CFO Rachel Wong.",
            "John raised data privacy concerns for the third time on May 10 2026, this time specifically about where customer conversation logs are stored. He said AmEx has a strict policy that no customer data can leave US data centers. This is a hard blocker unless we can confirm US-only storage.",
        ],
    },
    {
        "bank_id": "sarah-malik-salesforce",
        "name": "Sarah Malik",
        "company": "Salesforce",
        "mission": "Tracking Sarah Malik, Director of Enterprise Sales at Salesforce. She is evaluating our product as a complement to Salesforce Einstein for their internal sales team.",
        "history": [
            "Initial discovery call February 20 2026. Sarah was warm and enthusiastic. She said Salesforce Einstein handles structured CRM data well but lacks conversational memory. She sees our product as a complementary layer. Potential deal size $180,000.",
            "Sarah introduced us to her team lead Marcus on March 12 2026. Marcus was more skeptical — asked about integration with Salesforce APIs and whether we could sync memories back into CRM records automatically.",
            "Sarah confirmed on April 8 2026 that she has budget approval up to $180k and wants to move to contract stage. She prefers to do a 3-month pilot first before full commitment. She mentioned Q3 is their target go-live.",
            "Contract redlines received April 30 2026. Sarah's legal team flagged two clauses: (1) data deletion timelines must be within 30 days of request, (2) they want a dedicated customer success manager included in the contract. Both are negotiable.",
        ],
    },
    {
        "bank_id": "raj-patel-stripe",
        "name": "Raj Patel",
        "company": "Stripe",
        "mission": "Tracking Raj Patel, Head of Partnerships at Stripe. Early stage discovery — evaluating fit for Stripe's internal customer success team.",
        "history": [
            "First call May 5 2026. Raj was referred by a mutual contact at YC. He runs a team of 12 customer success managers and is frustrated that each CSM has their own notes system with no shared memory. He wants a unified customer intelligence layer.",
            "Raj mentioned on May 20 2026 that Stripe moves fast and hates long procurement cycles. He said if we can get a working demo into his team's hands within 2 weeks he can get informal approval from his VP without going through full procurement.",
            "Raj prefers Slack communication over email. He is extremely technical and wants to see the API documentation before any further calls. Budget is approximately $95,000 but could grow to $200k if adoption is strong.",
        ],
    },
    {
        "bank_id": "emily-torres-notion",
        "name": "Emily Torres",
        "company": "Notion",
        "mission": "Tracking Emily Torres, CRO at Notion. This is a closed-won deal — Emily is now a customer. Tracking post-sales interactions and expansion opportunities.",
        "history": [
            "Deal closed January 15 2026 at $320,000 for annual enterprise license. Emily championed the deal internally. She was the fastest decision maker we have encountered — from first demo to signed contract in 6 weeks.",
            "Onboarding call February 3 2026. Emily's team of 8 sales reps started using the platform. Initial feedback was very positive. Reps said the pre-call briefing feature saved them 20-30 minutes per customer per week.",
            "30-day check-in February 28 2026. Emily reported that pipeline conversion rate increased by 12% in the first month. She is now interested in expanding to the customer support team — potential expansion value $80,000.",
            "Emily referred two contacts from her network: James Wu at Linear and Ana Sousa at Figma. Both are warm leads. Emily said she would provide a reference call for any prospect we introduce her to.",
            "Expansion discussion May 15 2026. Emily confirmed budget for customer support team expansion. She wants to start in July 2026 after their team restructuring is complete.",
        ],
    },
    {
        "bank_id": "david-kim-openai",
        "name": "David Kim",
        "company": "OpenAI",
        "mission": "Tracking David Kim, Enterprise Account Manager at OpenAI. Very early stage — OpenAI is exploring whether to use our memory layer for their own enterprise customer interactions.",
        "history": [
            "Introduction call June 1 2026. David reached out to us — unusual, as OpenAI is typically a competitor in the AI space. He explained that OpenAI's enterprise team manages large Fortune 500 accounts and their internal tooling lacks persistent memory across customer conversations.",
            "David is evaluating 3 vendors simultaneously. He mentioned Mem0 and another internal tool. Deal size could be $500,000 if they deploy across their entire 40-person enterprise team. David moves slowly and methodically — said he will take 60 days minimum to evaluate.",
        ],
    },
]


def seed_all():
    print("🌱 MemoryDesk Data Seeder Starting...\n")

    for customer in CUSTOMER_DATA:
        print(f"📋 Processing: {customer['name']} ({customer['company']})")

        # Create memory bank
        try:
            hindsight.create_bank(
                bank_id=customer["bank_id"],
                name=f"{customer['name']} - {customer['company']}",
                mission=customer["mission"],
            )
            print(f"   ✅ Memory bank created: {customer['bank_id']}")
        except Exception as e:
            print(f"   ⚠️  Bank may already exist: {e}")

        # Retain each history item
        for i, memory in enumerate(customer["history"]):
            try:
                hindsight.retain(
                    bank_id=customer["bank_id"],
                    content=memory,
                    tags=["seed-data", "sales-history"],
                )
                print(f"   💾 Memory {i+1}/{len(customer['history'])} stored")
                time.sleep(0.5)  # Be gentle with the API
            except Exception as e:
                print(f"   ❌ Error storing memory {i+1}: {e}")

        print(f"   🎉 Done with {customer['name']}\n")

    print("✅ All seed data loaded! Your demo is ready.")
    print("\nCustomers loaded:")
    for c in CUSTOMER_DATA:
        print(f"  • {c['name']} ({c['company']}) → bank_id: {c['bank_id']}")


if __name__ == "__main__":
    seed_all()
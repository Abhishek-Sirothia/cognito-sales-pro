"""
MemoryDesk — Synthetic Data Seeder
Run this ONCE to populate Hindsight with realistic customer history.
"""

from hindsight_client import Hindsight
import time

HINDSIGHT_ENDPOINT = "https://api.hindsight.vectorize.io"
HINDSIGHT_API_KEY = "hsk_f029ea01adf71a82a4ef28d0638b541b_baea9b5ee371c27a"

hindsight = Hindsight(HINDSIGHT_ENDPOINT, HINDSIGHT_API_KEY)

CUSTOMER_DATA = [
    {
        "bank_id": "john-chen-amex",
        "name": "John Chen",
        "company": "American Express",
        "history": [
            "First call on March 15 2026. John was interested but asked pointed questions about data residency and GDPR compliance. He mentioned they had a bad experience with a previous vendor who leaked customer data. Deal value discussed: $250,000 annual contract.",
            "Follow-up demo on March 28 2026. John brought his security team lead, Priya Nair. Priya asked about SOC2 Type II certification and penetration test reports. John seemed impressed with the UI but Priya raised concerns about API rate limits.",
            "John sent email on April 5 2026 saying he preferred async follow-ups over calls. He mentioned he is extremely busy with AmEx Q2 planning cycle and prefers detailed written summaries after each meeting.",
            "Pricing call on April 22 2026. John pushed back hard on the $250k price. Competing offer from rival vendor at $190k. Budget approval needs sign-off from CFO Rachel Wong.",
            "John raised data privacy concerns on May 10 2026. AmEx has strict policy that no customer data can leave US data centers. This is a hard blocker.",
        ],
    },
    {
        "bank_id": "sarah-malik-salesforce",
        "name": "Sarah Malik",
        "company": "Salesforce",
        "history": [
            "Initial discovery call February 20 2026. Sarah was warm and enthusiastic. Salesforce Einstein lacks conversational memory. Potential deal size $180,000.",
            "Sarah introduced us to her team lead Marcus on March 12 2026. Marcus asked about integration with Salesforce APIs.",
            "Sarah confirmed on April 8 2026 that she has budget approval up to $180k and wants a 3-month pilot first. Q3 is their target go-live.",
            "Contract redlines received April 30 2026. Legal flagged data deletion timelines and dedicated CSM requirement.",
        ],
    },
    {
        "bank_id": "raj-patel-stripe",
        "name": "Raj Patel",
        "company": "Stripe",
        "history": [
            "First call May 5 2026. Raj runs 12 CSMs frustrated with no shared memory system. Budget approximately $95,000.",
            "Raj mentioned on May 20 2026 that Stripe moves fast and hates long procurement cycles. Demo needed within 2 weeks.",
            "Raj prefers Slack over email. Extremely technical. Wants API docs before further calls. Budget could grow to $200k.",
        ],
    },
    {
        "bank_id": "emily-torres-notion",
        "name": "Emily Torres",
        "company": "Notion",
        "history": [
            "Deal closed January 15 2026 at $320,000 for annual enterprise license. Fastest decision maker — 6 weeks from demo to contract.",
            "Onboarding call February 3 2026. Team of 8 sales reps started using platform. Pre-call briefing saved 20-30 min per customer per week.",
            "30-day check-in February 28 2026. Pipeline conversion rate increased 12%. Interested in expanding to customer support team for $80,000.",
            "Emily referred James Wu at Linear and Ana Sousa at Figma as warm leads.",
            "Expansion discussion May 15 2026. Budget confirmed. Starting July 2026 after team restructuring.",
        ],
    },
    {
        "bank_id": "david-kim-openai",
        "name": "David Kim",
        "company": "OpenAI",
        "history": [
            "Introduction call June 1 2026. David reached out. OpenAI enterprise team lacks persistent memory across customer conversations.",
            "David evaluating 3 vendors including Mem0. Deal size could be $500,000 across 40-person enterprise team. Will take 60 days minimum.",
        ],
    },
]


def seed_all():
    print("🌱 MemoryDesk Data Seeder Starting...\n")

    for customer in CUSTOMER_DATA:
        print(f"📋 Processing: {customer['name']} ({customer['company']})")

        try:
            hindsight.create_bank(
                bank_id=customer["bank_id"],
                name=f"{customer['name']} - {customer['company']}",
            )
            print(f"   ✅ Memory bank created: {customer['bank_id']}")
        except Exception as e:
            print(f"   ⚠️  Bank may already exist: {e}")

        for i, memory in enumerate(customer["history"]):
            try:
                hindsight.retain(
                    bank_id=customer["bank_id"],
                    content=memory,
                )
                print(f"   💾 Memory {i+1}/{len(customer['history'])} stored")
                time.sleep(0.5)
            except Exception as e:
                print(f"   ❌ Error storing memory {i+1}: {e}")

        print(f"   🎉 Done with {customer['name']}\n")

    print("✅ All seed data loaded! Your demo is ready.")
    print("\nCustomers loaded:")
    for c in CUSTOMER_DATA:
        print(f"  • {c['name']} ({c['company']}) → bank_id: {c['bank_id']}")


if __name__ == "__main__":
    seed_all()

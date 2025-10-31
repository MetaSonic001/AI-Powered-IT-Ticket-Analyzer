#!/usr/bin/env python3
"""
Test script to verify the dynamic database integration is working
Run this after starting the API to test ticket persistence
"""

import requests
import time
from datetime import datetime

API_URL = "http://localhost:8000"

def test_health():
    """Test API health"""
    print("🔍 Testing API health...")
    try:
        response = requests.get(f"{API_URL}/api/v1/health")
        if response.status_code == 200:
            print("✅ API is healthy")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        return False

def test_analyze_ticket():
    """Test ticket analysis and database persistence"""
    print("\n🎫 Testing ticket analysis...")
    
    ticket_data = {
        "title": "Test WiFi Connection Issue",
        "description": "My laptop cannot connect to the office WiFi network. Getting 'authentication failed' error repeatedly. This started happening after the latest Windows 11 update.",
        "requester_info": {
            "name": "Test User",
            "email": "test.user@company.com",
            "department": "Engineering"
        }
    }
    
    try:
        response = requests.post(
            f"{API_URL}/api/v1/tickets/analyze",
            json=ticket_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            ticket_id = result.get("ticket_id")
            print(f"✅ Ticket analyzed successfully: {ticket_id}")
            print(f"   Category: {result['classification']['category']}")
            print(f"   Priority: {result['priority_prediction']['priority']}")
            print(f"   Solutions: {len(result['recommended_solutions'])} found")
            return ticket_id
        else:
            print(f"❌ Ticket analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Analysis request failed: {e}")
        return None

def test_ticket_history():
    """Test ticket history retrieval"""
    print("\n📋 Testing ticket history...")
    
    try:
        response = requests.get(f"{API_URL}/api/v1/tickets/history?limit=10")
        
        if response.status_code == 200:
            result = response.json()
            total = result.get("total", 0)
            tickets = result.get("tickets", [])
            print(f"✅ Retrieved {len(tickets)} tickets (total: {total})")
            
            if tickets:
                for i, ticket in enumerate(tickets[:3], 1):
                    print(f"   {i}. [{ticket['ticket_id']}] {ticket['title'][:50]}...")
            return True
        else:
            print(f"❌ Ticket history failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ History request failed: {e}")
        return False

def test_analytics_dashboard():
    """Test analytics dashboard with database data"""
    print("\n📊 Testing analytics dashboard...")
    
    try:
        response = requests.get(f"{API_URL}/api/v1/analytics/dashboard?days=30")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analytics loaded successfully")
            print(f"   Total Tickets: {result.get('total_tickets', 0)}")
            print(f"   Avg Processing Time: {result.get('avg_processing_time', 0):.2f}ms")
            print(f"   Classification Accuracy: {result.get('classification_accuracy', 0):.2%}")
            print(f"   Knowledge Base Size: {result.get('knowledge_base_size', 0)}")
            
            categories = result.get('category_breakdown', [])
            if categories:
                print(f"   Categories: {len(categories)}")
                for cat in categories[:3]:
                    print(f"      - {cat['category']}: {cat['count']} tickets")
            
            return True
        else:
            print(f"❌ Analytics dashboard failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Analytics request failed: {e}")
        return False

def test_agent_performance():
    """Test agent performance metrics"""
    print("\n🤖 Testing agent performance...")
    
    try:
        response = requests.get(f"{API_URL}/api/v1/agents/performance?days=30")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Agent performance loaded successfully")
            print(f"   Classification Accuracy: {result.get('classification_accuracy', 0):.2%}")
            print(f"   Priority Accuracy: {result.get('priority_accuracy', 0):.2%}")
            print(f"   Solution Success Rate: {result.get('solution_success_rate', 0):.2%}")
            print(f"   Total Predictions: {result.get('total_predictions', 0)}")
            return True
        else:
            print(f"❌ Agent performance failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Agent performance request failed: {e}")
        return False

def test_get_specific_ticket(ticket_id):
    """Test retrieving specific ticket"""
    if not ticket_id:
        print("\n⏭️  Skipping specific ticket test (no ticket ID)")
        return False
    
    print(f"\n🔍 Testing specific ticket retrieval ({ticket_id})...")
    
    try:
        response = requests.get(f"{API_URL}/api/v1/tickets/{ticket_id}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Ticket retrieved successfully")
            print(f"   Title: {result.get('title', 'N/A')[:60]}...")
            print(f"   Status: {result.get('status', 'N/A')}")
            print(f"   Created: {result.get('created_at', 'N/A')[:19]}")
            solutions = result.get('recommended_solutions', [])
            print(f"   Solutions: {len(solutions)}")
            return True
        else:
            print(f"❌ Specific ticket retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Specific ticket request failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Dynamic Database Integration Tests")
    print("=" * 60)
    print(f"API URL: {API_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Run tests
    results = []
    
    # 1. Health check
    results.append(("API Health", test_health()))
    
    if not results[-1][1]:
        print("\n❌ API is not running. Please start the API first:")
        print("   cd API && python main.py")
        return
    
    time.sleep(0.5)
    
    # 2. Analyze ticket (creates DB entry)
    ticket_id = test_analyze_ticket()
    results.append(("Ticket Analysis", ticket_id is not None))
    
    time.sleep(0.5)
    
    # 3. Get ticket history
    results.append(("Ticket History", test_ticket_history()))
    
    time.sleep(0.5)
    
    # 4. Get specific ticket
    results.append(("Specific Ticket", test_get_specific_ticket(ticket_id)))
    
    time.sleep(0.5)
    
    # 5. Analytics dashboard
    results.append(("Analytics Dashboard", test_analytics_dashboard()))
    
    time.sleep(0.5)
    
    # 6. Agent performance
    results.append(("Agent Performance", test_agent_performance()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("=" * 60)
    print(f"Total: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 All tests passed! Your dynamic system is fully functional!")
        print("\n📚 Next steps:")
        print("   1. Open http://localhost:3000 to use the frontend")
        print("   2. Analyze some tickets at /dashboard/tickets/analyze")
        print("   3. View analytics at /dashboard/analytics")
        print("   4. Check agent performance at /dashboard/agents")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        print("   Make sure the API is running and database is accessible.")

if __name__ == "__main__":
    main()

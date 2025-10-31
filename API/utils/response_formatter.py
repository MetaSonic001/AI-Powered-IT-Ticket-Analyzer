"""
Response Formatting Utilities for IT Ticket Analysis
Provides plain-English summaries, action items, and user-friendly formatting
"""

from typing import Dict, List, Any
from datetime import datetime


class ResponseFormatter:
    """Format analysis responses for better UX"""
    
    @staticmethod
    def generate_plain_english_summary(result: Dict[str, Any]) -> str:
        """Generate non-technical summary of analysis"""
        
        category = result.get("classification", {}).get("category", "Unknown")
        priority = result.get("priority_prediction", {}).get("priority", "Medium")
        solutions = result.get("recommended_solutions", [])
        solutions_count = len(solutions)
        
        # Build summary parts
        summary_parts = []
        
        # What we found
        summary_parts.append(f"We identified this as a **{category}** issue.")
        
        # Priority explanation
        priority_explanations = {
            "Critical": "This is urgent and needs immediate attention",
            "High": "This should be addressed soon as it's blocking your work",
            "Medium": "This can be resolved within the next day",
            "Low": "This can be addressed when time permits"
        }
        summary_parts.append(priority_explanations.get(priority, "This will be addressed in the normal queue."))
        
        # Solutions available
        if solutions_count > 0:
            solution_time = solutions[0].get("estimated_time_minutes", 15)
            summary_parts.append(
                f"We found {solutions_count} potential solution{'s' if solutions_count > 1 else ''} "
                f"that might help. The first one should take about {solution_time} minutes to try."
            )
        else:
            summary_parts.append(
                "We'll need to investigate this further. A technician will be assigned to help you."
            )
        
        # Next steps
        if priority in ["Critical", "High"]:
            summary_parts.append("We recommend contacting IT support directly for faster resolution.")
        else:
            summary_parts.append("Try the recommended solutions below, and let us know if they work!")
        
        return " ".join(summary_parts)
    
    @staticmethod
    def add_action_items(result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Add clear action items based on analysis"""
        
        priority = result.get("priority_prediction", {}).get("priority", "Medium")
        solutions = result.get("recommended_solutions", [])
        
        action_items = []
        
        # Primary action based on priority
        if priority == "Critical":
            action_items.append({
                "priority": 1,
                "action": "🚨 Contact IT Help Desk immediately",
                "contact": "Call ext. 5555 or use chat support",
                "urgency": "Immediate action required"
            })
        elif priority == "High":
            action_items.append({
                "priority": 1,
                "action": "📞 Contact IT Support soon",
                "contact": "Call ext. 5555 or submit priority ticket",
                "urgency": "Address within 4 hours"
            })
        
        # Try self-service solution if available
        if solutions and len(solutions) > 0:
            top_solution = solutions[0]
            similarity = top_solution.get("similarity_score", 0.0)
            
            if similarity > 0.7:
                action_items.append({
                    "priority": 2 if priority in ["Critical", "High"] else 1,
                    "action": f"Try recommended solution: {top_solution.get('title', 'See recommended solutions')}",
                    "estimated_time": f"{top_solution.get('estimated_time_minutes', 15)} minutes",
                    "success_rate": f"{top_solution.get('success_rate', 0.7) * 100:.0f}% success rate"
                })
        
        # Escalation path
        action_items.append({
            "priority": 3,
            "action": "If issue persists after trying solutions",
            "contact": "Submit ticket with this analysis attached",
            "note": "Include error messages and steps already tried"
        })
        
        return action_items
    
    @staticmethod
    def add_resolution_timeline(
        solutions: List[Dict[str, Any]], 
        priority: str
    ) -> Dict[str, str]:
        """Add estimated timeline based on priority and solution complexity"""
        
        if not solutions:
            return {
                "estimated_start": "Within 24 hours",
                "estimated_completion": "48-72 hours",
                "next_steps": "Ticket will be assigned to appropriate team",
                "sla": "Normal queue"
            }
        
        # Calculate based on first solution
        solution_time = solutions[0].get("estimated_time_minutes", 20)
        
        timeline_map = {
            "Critical": {
                "estimated_start": "Immediate (within 1 hour)",
                "estimated_completion": f"{solution_time} minutes (after technician assigned)",
                "sla": "2 hours maximum",
                "next_steps": "Technician will be assigned immediately"
            },
            "High": {
                "estimated_start": "Within 4 hours",
                "estimated_completion": f"{solution_time} minutes to {solution_time * 2} minutes",
                "sla": "8 hours maximum",
                "next_steps": "Priority queue - will be addressed today"
            },
            "Medium": {
                "estimated_start": "Within 1 business day",
                "estimated_completion": f"{solution_time // 60 if solution_time > 60 else 1}-{solution_time // 30 if solution_time > 30 else 2} hours",
                "sla": "24 hours maximum",
                "next_steps": "Standard queue - addressed within business day"
            },
            "Low": {
                "estimated_start": "Within 2-3 business days",
                "estimated_completion": "1-3 days",
                "sla": "72 hours maximum",
                "next_steps": "Will be scheduled with other maintenance"
            }
        }
        
        return timeline_map.get(priority, timeline_map["Medium"])
    
    @staticmethod
    def add_confidence_warnings(result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Add warnings for low-confidence results"""
        
        warnings = []
        
        # Classification confidence check
        classification = result.get("classification", {})
        class_confidence = classification.get("confidence", 1.0)
        if class_confidence < 0.75:
            warnings.append({
                "type": "low_classification_confidence",
                "severity": "medium",
                "message": "Classification confidence below threshold - manual review recommended",
                "confidence": round(class_confidence, 2),
                "suggestion": "A technician should verify the category assignment"
            })
        
        # Priority confidence check
        priority_pred = result.get("priority_prediction", {})
        priority_confidence = priority_pred.get("confidence", 1.0)
        if priority_confidence < 0.70:
            warnings.append({
                "type": "low_priority_confidence",
                "severity": "low",
                "message": "Priority prediction has lower confidence",
                "confidence": round(priority_confidence, 2),
                "suggestion": "Consider reviewing priority based on business impact"
            })
        
        # Solution relevance check
        solutions = result.get("recommended_solutions", [])
        if solutions:
            avg_similarity = sum(s.get("similarity_score", 0) for s in solutions) / len(solutions)
            if avg_similarity < 0.60:
                warnings.append({
                    "type": "low_solution_relevance",
                    "severity": "medium",
                    "message": "Recommended solutions have low similarity - may not be relevant",
                    "avg_similarity": round(avg_similarity, 2),
                    "suggestion": "Consider consulting knowledge base manually or escalating to technician"
                })
        
        return warnings
    
    @staticmethod
    def format_complete_response(result: Dict[str, Any]) -> Dict[str, Any]:
        """Add all formatting enhancements to the response"""
        
        # Add plain-English summary
        result["summary"] = ResponseFormatter.generate_plain_english_summary(result)
        
        # Add action items
        result["action_items"] = ResponseFormatter.add_action_items(result)
        
        # Add resolution timeline
        priority = result.get("priority_prediction", {}).get("priority", "Medium")
        solutions = result.get("recommended_solutions", [])
        result["resolution_timeline"] = ResponseFormatter.add_resolution_timeline(solutions, priority)
        
        # Add confidence warnings if needed
        warnings = ResponseFormatter.add_confidence_warnings(result)
        if warnings:
            result["warnings"] = warnings
        
        # Add metadata
        result["formatted_at"] = datetime.utcnow().isoformat()
        result["format_version"] = "1.0"
        
        return result


# Singleton instance
response_formatter = ResponseFormatter()

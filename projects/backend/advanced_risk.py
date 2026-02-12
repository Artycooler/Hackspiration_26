"""Advanced AI Risk Scoring Engine"""
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple


class RiskScoringEngine:
    """Advanced AI-based risk assessment for rental properties and tenants"""
    
    def __init__(self):
        self.weights = {
            'payment_history': 0.35,
            'credit_score': 0.25,
            'property_condition': 0.15,
            'tenant_disputes': 0.15,
            'market_volatility': 0.10
        }
    
    def calculate_tenant_risk(
        self, 
        payment_delays: int,
        payment_failures: int,
        credit_score: float,
        dispute_count: int,
        tenure_months: int,
        previous_evictions: int
    ) -> Tuple[float, str, Dict]:
        """
        Calculate comprehensive tenant risk score
        Returns: (score, level, factors_dict)
        """
        factors = {}
        
        # Payment History Score (0-100)
        payment_score = 100
        payment_score -= min(payment_delays * 5, 30)  # Max -30 for delays
        payment_score -= min(payment_failures * 15, 50)  # Max -50 for failures
        factors['payment_history'] = payment_score
        
        # Credit Score Normalization (0-100)
        if credit_score == 0:
            credit_normalized = 50  # Unknown credit
        else:
            credit_normalized = min(100, (credit_score / 850) * 100)
        factors['credit_score'] = credit_normalized
        
        # Dispute History (0-100)
        dispute_score = 100 - min(dispute_count * 20, 70)
        factors['dispute_history'] = dispute_score
        
        # Eviction History (0-100)
        eviction_score = 100 - min(previous_evictions * 50, 100)
        factors['eviction_history'] = eviction_score
        
        # Tenure Bonus (longer tenure = lower risk)
        tenure_bonus = min(tenure_months * 1, 15)
        factors['tenure_stability'] = 50 + tenure_bonus
        
        # Calculate weighted score
        weighted_score = (
            factors['payment_history'] * 0.35 +
            factors['credit_score'] * 0.25 +
            factors['dispute_history'] * 0.20 +
            factors['eviction_history'] * 0.10 +
            factors['tenure_stability'] * 0.10
        )
        
        weighted_score = max(0, min(100, weighted_score))
        
        # Determine risk level
        if weighted_score >= 80:
            risk_level = "LOW"
        elif weighted_score >= 60:
            risk_level = "MEDIUM"
        elif weighted_score >= 40:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"
        
        return weighted_score, risk_level, factors
    
    def calculate_property_risk(
        self,
        property_age_years: float,
        maintenance_issues: int,
        vacancy_rate: float,
        location_score: float,
        market_value: float,
        insurance_claims: int
    ) -> Tuple[float, str, Dict]:
        """
        Calculate property-level risk score
        """
        factors = {}
        
        # Property Condition Score (0-100)
        condition_score = 100
        condition_score -= min(maintenance_issues * 5, 40)
        condition_score -= min(property_age_years * 1, 20)
        factors['property_condition'] = condition_score
        
        # Location Score (0-100)
        factors['location_desirability'] = location_score
        
        # Market Volatility (inverse of vacancy rate)
        market_score = 100 - (vacancy_rate * 100)
        factors['market_stability'] = max(0, market_score)
        
        # Insurance Claims History (0-100)
        claims_score = 100 - min(insurance_claims * 20, 80)
        factors['insurance_history'] = claims_score
        
        # Asset Risk (based on value)
        if market_value < 100000:
            asset_risk = 60
        elif market_value < 300000:
            asset_risk = 70
        else:
            asset_risk = 80
        factors['asset_value_stability'] = asset_risk
        
        # Weighted Score
        weighted_score = (
            factors['property_condition'] * 0.30 +
            factors['location_desirability'] * 0.25 +
            factors['market_stability'] * 0.20 +
            factors['insurance_history'] * 0.15 +
            factors['asset_value_stability'] * 0.10
        )
        
        weighted_score = max(0, min(100, weighted_score))
        
        if weighted_score >= 80:
            risk_level = "LOW"
        elif weighted_score >= 60:
            risk_level = "MEDIUM"
        elif weighted_score >= 40:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"
        
        return weighted_score, risk_level, factors
    
    def calculate_portfolio_risk(
        self,
        properties: List[Dict],
        tenants: List[Dict]
    ) -> Dict:
        """
        Calculate portfolio-level risk metrics
        """
        if not properties or not tenants:
            return {"error": "Insufficient data"}
        
        # Aggregate property risks
        property_scores = [p.get('risk_score', 50) for p in properties]
        avg_property_risk = sum(property_scores) / len(property_scores)
        
        # Aggregate tenant risks
        tenant_scores = [t.get('risk_score', 50) for t in tenants]
        avg_tenant_risk = sum(tenant_scores) / len(tenant_scores)
        
        # Portfolio diversification score
        occupancy_rate = len([t for t in tenants if t.get('is_active')]) / len(properties) * 100
        
        # Overall portfolio score
        portfolio_score = (avg_property_risk * 0.4 + avg_tenant_risk * 0.4 + occupancy_rate * 0.2)
        
        return {
            "portfolio_score": portfolio_score,
            "avg_property_risk": avg_property_risk,
            "avg_tenant_risk": avg_tenant_risk,
            "occupancy_rate": occupancy_rate,
            "property_count": len(properties),
            "tenant_count": len(tenants),
            "vacancy_rate": (1 - occupancy_rate / 100) * 100
        }
    
    def get_risk_recommendations(self, risk_score: float, risk_level: str) -> List[str]:
        """Get actionable recommendations based on risk assessment"""
        recommendations = []
        
        if risk_level == "CRITICAL":
            recommendations.append("⚠️ CRITICAL: Do not proceed without additional verification")
            recommendations.append("Conduct thorough background check")
            recommendations.append("Consider higher deposit or additional guarantees")
            recommendations.append("Schedule frequent inspections")
        elif risk_level == "HIGH":
            recommendations.append("⚠️ HIGH RISK: Require additional documentation")
            recommendations.append("Verify employment and income")
            recommendations.append("Consider higher monthly rent security")
            recommendations.append("Implement stricter inspection schedule")
        elif risk_level == "MEDIUM":
            recommendations.append("✓ MEDIUM RISK: Standard verification recommended")
            recommendations.append("Verify employment information")
            recommendations.append("Normal monitoring recommended")
        else:  # LOW
            recommendations.append("✓ LOW RISK: Standard tenant approved")
            recommendations.append("Proceed with lease agreement")
        
        return recommendations


# Singleton instance
risk_engine = RiskScoringEngine()


def get_risk_engine() -> RiskScoringEngine:
    """Get the risk scoring engine instance"""
    return risk_engine

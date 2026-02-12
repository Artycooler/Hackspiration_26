properties = [
    {"id":1,"rent":15000,"risk":"LOW"},
    {"id":2,"rent":22000,"risk":"MEDIUM"},
    {"id":3,"rent":18000,"risk":"HIGH"}
]

def summary():
    return {
        "total": len(properties),
        "income": sum(p["rent"] for p in properties),
        "high_risk": len([p for p in properties if p["risk"]=="HIGH"])
    }

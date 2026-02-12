def calculate_risk(delay, disputes, success):
    score = 100 - (delay*10 + disputes*20) + success*15
    score = max(0, min(score, 100))
    if score > 80:
        return score, "LOW"
    if score > 50:
        return score, "MEDIUM"
    return score, "HIGH"

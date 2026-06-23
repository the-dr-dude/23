import base64

with open("reasons.json", "r") as f:
    raw = f.read()

encoded = base64.b64encode(raw.encode()).decode()

with open("js/data.js", "w") as f:
    f.write(f'const REASONS_DATA = "{encoded}";')

print("done")

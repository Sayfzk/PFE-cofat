with open('src/components/user/pages/style/NonIndustrialBudget.css', 'r') as f:
    lines = f.readlines()

with open('src/components/user/pages/style/NonIndustrialBudget.css', 'w') as f:
    for i, line in enumerate(lines, 1):
        if i not in [1124, 1125, 1126]:
            f.write(line)

with open('src/presentation/screens/common/FeatureWorkspacePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the garbled key
import re
content = re.sub(r'key=\{[^}]*\+\\"\\"+\}', 'key={`${item}-${i}`}', content)
print(repr(content[content.find('items.map'):content.find('items.map')+200]))

with open('src/presentation/screens/common/FeatureWorkspacePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('done')

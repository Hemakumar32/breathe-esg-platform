import os
import re

dir_path = os.path.join(os.path.dirname(__file__), 'frontend', 'src', 'pages')

for filename in os.listdir(dir_path):
    if filename.endswith('.jsx'):
        file_path = os.path.join(dir_path, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Change H1 headers
        content = re.sub(r'className="(.*?)text-2xl font-bold text-gray-900(.*?)"', r'className="\1text-[32px] font-semibold text-[#0f172a] tracking-tight\2"', content)
        content = re.sub(r'className="(.*?)text-2xl font-bold(.*?)"', r'className="\1text-[32px] font-semibold tracking-tight\2"', content)

        # 2. Change subtext paragraphs
        content = re.sub(r'<p className="(.*?)text-gray-500 text-sm mt-1(.*?)"', r'<p className="\1text-gray-500 text-[15px] mt-2\2"', content)

        # 3. Change generic tables
        content = re.sub(r'<table className="(.*?)text-xs(.*?)"', r'<table className="\1text-sm\2"', content)

        # 4. Update table headers
        content = re.sub(r'<th className="(.*?)font-bold text-gray-900 tracking-wider(.*?)"', r'<th className="\1text-xs font-bold text-gray-500 uppercase tracking-wider\2"', content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

app_jsx_path = os.path.join(os.path.dirname(__file__), 'frontend', 'src', 'App.jsx')
with open(app_jsx_path, 'r', encoding='utf-8') as f:
    app_jsx = f.read()
app_jsx = re.sub(r'<h2 className="(.*?)text-2xl font-bold text-gray-900(.*?)"', r'<h2 className="\1text-[32px] font-semibold text-[#0f172a] tracking-tight\2"', app_jsx)
with open(app_jsx_path, 'w', encoding='utf-8') as f:
    f.write(app_jsx)

print('Fonts fixed!')

# Gộp xung đột "cả hai cùng thêm vào cuối danh sách": giữ HEAD + phần mới của nhánh kia
import re, sys
JOIN = {
    'index.html': '\n',
    'js/data/modules.js': '\n        },\n        {\n',
    'js/data/evolutions.js': '\n    ],\n',
}
def resolve(path):
    s = open(path).read()
    pat = re.compile(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', re.S)
    def rep(m):
        ours, theirs = m.group(1), m.group(2)
        if path.endswith('netstate.js') or path.endswith('smart-bot.js'):
            # giữ dòng của HEAD, thêm các dòng/tên mới của nhánh kia
            oursl = ours.rstrip('\n').split('\n')
            names = set(re.findall(r'\b[A-Za-z_]\w*\b', ours))
            extra = [l for l in theirs.rstrip('\n').split('\n') if not set(re.findall(r'\b[A-Za-z_]\w*\b', l)) <= names]
            return '\n'.join(oursl + extra) + '\n'
        j = JOIN.get(path, '\n')
        return ours.rstrip('\n') + j + theirs if j != '\n' else ours + theirs
    s2 = pat.sub(rep, s)
    open(path, 'w').write(s2)
    print(path, 'conflicts left:', s2.count('<<<<<<<'))
for p in sys.argv[1:]: resolve(p)

import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = '技术设计文档.docx'

if not os.path.exists(docx_path):
    print(f"Error: {docx_path} not found.")
    exit(1)

try:
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        # XML namespace for Word
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text_content = []
        # Find all paragraphs
        for p in root.findall('.//w:p', ns):
            para_text = []
            # Find all runs in the paragraph
            for r in p.findall('.//w:r', ns):
                # Find all text elements in the run
                for t in r.findall('.//w:t', ns):
                    if t.text:
                        para_text.append(t.text)
            if para_text:
                text_content.append(''.join(para_text))
        
        print('\n'.join(text_content))

except Exception as e:
    print(f"Error reading docx: {e}")

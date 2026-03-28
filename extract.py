import zipfile, xml.etree.ElementTree as ET, os

def extract_text_from_pptx(filepath):
    texts = []
    with zipfile.ZipFile(filepath, 'r') as z:
        slide_files = sorted([f for f in z.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')])
        for i, slide_file in enumerate(slide_files):
            slide_texts = []
            with z.open(slide_file) as f:
                tree = ET.parse(f)
                root = tree.getroot()
                for p_elem in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                    para_text = ''
                    for r_elem in p_elem.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
                        if r_elem.text:
                            para_text += r_elem.text
                    if para_text.strip():
                        slide_texts.append(para_text.strip())
            if slide_texts:
                texts.append(f"\n--- Slide {i+1} ---")
                for t in slide_texts:
                    texts.append(t)
    return '\n'.join(texts)

files = ["DriveSafe_AI_Engineering.pptx", "DriveSafe_Team_Roles.pptx"]
output = []
for fpath in files:
    output.append(f"\n{'='*60}")
    output.append(f"FILE: {fpath}")
    output.append(f"{'='*60}")
    output.append(extract_text_from_pptx(fpath))

with open('extracted_content.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))
print("Done!")

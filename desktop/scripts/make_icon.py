from PIL import Image
from pathlib import Path
root=Path(__file__).resolve().parents[2]
source=root/'site'/'novalab-icon-180.png'
output=root/'desktop'/'build'/'novalab-code.ico'
output.parent.mkdir(parents=True,exist_ok=True)
img=Image.open(source).convert('RGBA').resize((256,256))
img.save(output,format='ICO',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
print('Windows app icon:',output)

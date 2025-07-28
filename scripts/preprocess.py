# scripts/preprocess.py
import cv2
import pytesseract
import sys
import json
import os

image_path = sys.argv[1]

def preprocess(path):
    img = cv2.imread(path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    processed_path = path.replace(".jpg", "_processed.png").replace(".jpeg", "_processed.png").replace(".png", "_processed.png")
    cv2.imwrite(processed_path, thresh)
    return processed_path

def extract_text(path):
    return pytesseract.image_to_string(path)

processed_img = preprocess(image_path)
extracted_text = extract_text(processed_img)

result = {
    "processed_image": processed_img,
    "text": extracted_text
}

print(json.dumps(result))

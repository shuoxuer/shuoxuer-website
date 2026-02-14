import cv2
import numpy as np
import base64
import tempfile
import os

def test_opencv():
    print(f"OpenCV Version: {cv2.__version__}")
    print(f"NumPy Version: {np.__version__}")
    
    # Create a dummy video file
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_video:
        temp_video_path = temp_video.name
    
    try:
        # Create a video with 10 frames
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_video_path, fourcc, 20.0, (640, 480))
        for _ in range(10):
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            out.write(frame)
        out.release()
        
        # Read it back
        cap = cv2.VideoCapture(temp_video_path)
        if not cap.isOpened():
            print("Error opening video file")
            return
            
        ret, frame = cap.read()
        if ret:
            print("Successfully read frame")
            _, buffer = cv2.imencode('.jpg', frame)
            b64_str = base64.b64encode(buffer).decode('utf-8')
            print(f"Base64 length: {len(b64_str)}")
        else:
            print("Failed to read frame")
        cap.release()
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)

if __name__ == "__main__":
    test_opencv()

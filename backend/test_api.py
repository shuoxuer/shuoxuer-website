import requests
import os

def test_video_upload():
    url = "http://127.0.0.1:8000/api/v1/analyze/video"
    
    # Create a dummy video file
    video_path = "temp_test_video.mp4"
    import cv2
    import numpy as np
    
    try:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(video_path, fourcc, 20.0, (640, 480))
        for _ in range(10):
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(frame, "Test", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            out.write(frame)
        out.release()
        
        with open(video_path, "rb") as f:
            files = {"video": ("test.mp4", f, "video/mp4")}
            data = {"coach": "hu", "severity": 5, "style": "conservative"}
            print("Sending request...")
            response = requests.post(url, files=files, data=data)
            print(f"Status Code: {response.status_code}")
            print(f"Response Text: {response.text}")
            
    except Exception as e:
        print(f"Test failed: {e}")
    finally:
        if os.path.exists(video_path):
            os.remove(video_path)

if __name__ == "__main__":
    test_video_upload()

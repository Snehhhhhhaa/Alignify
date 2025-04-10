import React, { useRef, useState, useEffect } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';
import { Button, Card, Typography, Progress, Alert, Row, Col } from 'antd';
import { PlayCircleOutlined, StopOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './CameraScreen.css';

const { Title, Text } = Typography;

// Helper: calculates angle (in degrees) between three points (with b as vertex)
const calculateAngle = (a, b, c) => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * (180.0 / Math.PI));
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
};

const CameraScreen = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraInstance, setCameraInstance] = useState(null);
  const [pose, setPose] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [postureScore, setPostureScore] = useState(0);
  const [postureStatus, setPostureStatus] = useState({
    message: 'Start posture analysis to begin',
    type: 'info'
  });
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [showTips, setShowTips] = useState(false);

  // Timer effect for session time
  useEffect(() => {
    let timer;
    if (isStarted) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted]);

  // Initialize MediaPipe Pose
  useEffect(() => {
    const poseInstance = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    
    poseInstance.setOptions({
      modelComplexity: 2,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    poseInstance.onResults(onResults);
    setPose(poseInstance);

    return () => {
      if (cameraInstance) cameraInstance.stop();
    };
  }, []);

  // Main onResults callback: draw full skeleton and analyze pose
  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      // Draw connectors first with a thicker line width
      drawingUtils.drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4
      });
      // Then draw landmarks with a small radius
      drawingUtils.drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 1,
        radius: 3
      });
      analyzePosture(results.poseLandmarks);
    } else {
      setPostureStatus({
        message: 'No person detected. Please position yourself in frame.',
        type: 'warning'
      });
    }
    ctx.restore();
  };

  // Perfect pose analysis using multiple metrics and angles
  const analyzePosture = (landmarks) => {
    // Use key landmarks by index (MediaPipe Pose provides 33 landmarks)
    const nose = landmarks[0];
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip ||
        !leftElbow || !rightElbow || !leftWrist || !rightWrist ||
        !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
      return;
    }

    // Calculate alignment metrics:
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipDiff = Math.abs(leftHip.y - rightHip.y);
    const headAlignment = Math.abs(((leftShoulder.x + rightShoulder.x) / 2) - nose.x);
    const spineAlignment = Math.abs(((leftShoulder.x + rightShoulder.x) / 2) - ((leftHip.x + rightHip.x) / 2));

    // Calculate joint angles
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    // Ideal angles (these are arbitrary values and can be refined)
    const idealElbowAngle = 160; // Slight bend when relaxed
    const idealKneeAngle = 175;  // Nearly straight leg
    const idealShoulderDiff = 0.02; // Shoulders should be nearly at the same level
    const idealHipDiff = 0.02; // Hips should be nearly level
    const idealHeadAlignment = 0.05; // Nose centered between shoulders
    const idealSpineAlignment = 0.05; // Shoulders and hips aligned vertically

    // Calculate penalties (the further from ideal, the higher the penalty)
    const elbowPenalty = (Math.abs(leftElbowAngle - idealElbowAngle) + Math.abs(rightElbowAngle - idealElbowAngle)) / 2;
    const kneePenalty = (Math.abs(leftKneeAngle - idealKneeAngle) + Math.abs(rightKneeAngle - idealKneeAngle)) / 2;
    const shoulderPenalty = Math.abs(shoulderDiff - idealShoulderDiff) * 100;
    const hipPenalty = Math.abs(hipDiff - idealHipDiff) * 100;
    const headPenalty = Math.abs(headAlignment - idealHeadAlignment) * 100;
    const spinePenalty = Math.abs(spineAlignment - idealSpineAlignment) * 100;

    // Combine penalties to derive a composite score
    const rawScore = 100 -
      (elbowPenalty * 0.5) -
      (kneePenalty * 0.5) -
      shoulderPenalty -
      hipPenalty -
      headPenalty -
      spinePenalty;
    const score = Math.max(0, Math.round(rawScore));

    setPostureScore(score);

    // Set status message based on score
    let message, type;
    if (score > 90) {
      message = 'Perfect posture! Outstanding alignment!';
      type = 'success';
    } else if (score > 75) {
      message = 'Great posture! A few minor adjustments needed.';
      type = 'success';
    } else if (score > 60) {
      message = 'Good posture, but room for improvement.';
      type = 'info';
    } else if (score > 40) {
      message = 'Fair posture – try to adjust your position.';
      type = 'warning';
    } else {
      message = 'Poor posture – significant adjustment needed.';
      type = 'error';
    }
    setPostureStatus({ message, type });

    // Save analysis history (keeping last 10 entries)
    setAnalysisHistory(prev => [
      ...prev.slice(-9),
      { score, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  // Start the camera and begin pose analysis
  const startCamera = async () => {
    if (!pose || !videoRef.current) return;

    try {
      setIsStarted(true);
      setPostureStatus({
        message: 'Analyzing your posture...',
        type: 'info'
      });

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 1280,
        height: 720
      });
      
      camera.start();
      setCameraInstance(camera);
    } catch (error) {
      console.error('Camera error:', error);
      setPostureStatus({
        message: 'Error accessing camera. Please check permissions.',
        type: 'error'
      });
    }
  };

  // Stop the camera and analysis
  const stopCamera = () => {
    if (cameraInstance) {
      cameraInstance.stop();
      setCameraInstance(null);
    }
    setIsStarted(false);
    setPostureStatus({
      message: 'Posture analysis stopped',
      type: 'info'
    });
  };

  // Format session time in mm:ss format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="camera-screen">
      <Title level={2} style={{ textAlign: 'center' }}>Perfect Pose Analysis</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card 
            title="Live Pose Analysis" 
            bordered={false}
            extra={<Text strong>{formatTime(sessionTime)}</Text>}
          >
            <div className="camera-container" style={{ position: 'relative' }}>
              <video 
                ref={videoRef} 
                width="100%" 
                height="auto" 
                style={{ 
                  display: isStarted ? 'block' : 'none',
                  borderRadius: 8 
                }}
                playsInline
                muted
              />
              <canvas 
                ref={canvasRef} 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0,
                  width: '100%',
                  height: '100%'
                }} 
              />
            </div>
            
            <div className="controls" style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                onClick={startCamera} 
                disabled={isStarted}
                size="large"
                style={{ marginRight: 8 }}
              >
                Start Analysis
              </Button>
              <Button 
                danger 
                icon={<StopOutlined />} 
                onClick={stopCamera} 
                disabled={!isStarted}
                size="large"
              >
                Stop
              </Button>
              <Button 
                type="text" 
                icon={<InfoCircleOutlined />} 
                onClick={() => setShowTips(!showTips)}
                style={{ marginLeft: 8 }}
              >
                {showTips ? 'Hide Tips' : 'Show Tips'}
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Pose Analysis Summary" bordered={false}>
            <Alert 
              message={postureStatus.message} 
              type={postureStatus.type} 
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Progress 
              percent={postureScore} 
              status={
                postureScore > 90 ? 'success' : 
                postureScore > 75 ? 'active' : 
                postureScore > 60 ? 'normal' : 'exception'
              }
              strokeColor={
                postureScore > 90 ? '#52c41a' : 
                postureScore > 75 ? '#73d13d' : 
                postureScore > 60 ? '#faad14' : '#f5222d'
              }
              format={() => `Pose Score: ${postureScore}`}
              style={{ marginBottom: 24 }}
            />
            
            <Title level={5}>Recent Analysis</Title>
            <div style={{ height: 150, overflowY: 'auto' }}>
              {analysisHistory.length > 0 ? (
                analysisHistory.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: 8
                  }}>
                    <Text>{item.timestamp}</Text>
                    <Text strong>{item.score}</Text>
                  </div>
                ))
              ) : (
                <Text type="secondary">No analysis data yet</Text>
              )}
            </div>
          </Card>
          
          {showTips && (
            <Card title="Pose Improvement Tips" style={{ marginTop: 16 }}>
              <ul style={{ paddingLeft: 20 }}>
                <li>Keep your shoulders and hips level.</li>
                <li>Maintain a slight bend in your elbows and a relaxed arm posture.</li>
                <li>Straighten your spine by aligning your head with your shoulders.</li>
                <li>Keep your knees relaxed and avoid locking them.</li>
                <li>Take regular breaks and adjust your posture frequently.</li>
              </ul>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CameraScreen;

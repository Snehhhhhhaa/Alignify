import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { Button, Card, Typography, Row, Col } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { db, auth } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './CameraScreen.css';

const { Title, Text } = Typography;

const CameraScreen = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const navigate = useNavigate();

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [postureDescription, setPostureDescription] = useState('');
  const [detector, setDetector] = useState(null);

  // Initialize the PoseNet model
  const initializePoseNet = async () => {
    await tf.ready();
    const model = poseDetection.SupportedModels.BlazePose;
    const detector = await poseDetection.createDetector(model, {
      runtime: 'tfjs',
      enableSmoothing: true,
      modelType: 'full',
    });
    setDetector(detector);
  };

  // Start the camera and posture detection
  const startCamera = async () => {
    try {
      const video = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
        setIsCameraOn(true);
        detectionIntervalRef.current = setInterval(detectPose, 1000);
      };
    } catch (error) {
      console.error('Error accessing the camera:', error);
    }
  };

  // Stop the camera and posture detection
  const stopCamera = () => {
    const video = videoRef.current;
    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
      setIsCameraOn(false);
    }

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  // Detect posture and classify it using TensorFlow.js
  const detectPose = async () => {
    if (!detector || !isCameraOn) return;

    const video = videoRef.current;
    const poses = await detector.estimatePoses(video);

    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;
      const leftShoulder = keypoints.find((kp) => kp.name === 'left_shoulder');
      const rightShoulder = keypoints.find((kp) => kp.name === 'right_shoulder');
      const leftHip = keypoints.find((kp) => kp.name === 'left_hip');
      const rightHip = keypoints.find((kp) => kp.name === 'right_hip');

      if (leftShoulder && rightShoulder && leftHip && rightHip) {
        const shoulderSlope = Math.abs(leftShoulder.y - rightShoulder.y);
        const hipSlope = Math.abs(leftHip.y - rightHip.y);

        let description = 'Analyzing posture...';
        let isGoodPosture = shoulderSlope < 30 && hipSlope < 30;
        
        if (isGoodPosture) {
          description = 'Great posture! Keep it up.';
        } else {
          description = 'Your posture needs improvement. Try sitting up straight and aligning your shoulders.';
        }

        setPostureDescription(description);
        savePostureData({ shoulderSlope, hipSlope, isGoodPosture, description });
      }
    }
  };

  // Save posture data to Firestore
  const savePostureData = async (data) => {
    try {
      await addDoc(collection(db, 'postureData'), {
        ...data,
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving posture data:', error);
    }
  };

  useEffect(() => {
    initializePoseNet();
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="camera-screen">
      <Title level={2}>Posture Correction</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Camera Feed" bordered={false}>
            <video ref={videoRef} width="100%" height="auto" style={{ display: 'block' }} />
            <canvas ref={canvasRef} width="640" height="480" style={{ position: 'absolute', top: 0, left: 0 }} />
            <div className="controls">
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={startCamera} disabled={isCameraOn}>
                Start
              </Button>
              <Button type="danger" icon={<StopOutlined />} onClick={stopCamera} disabled={!isCameraOn}>
                Stop
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Posture Analysis" bordered={false}>
            <Text>{postureDescription || 'Start the camera to analyze your posture.'}</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CameraScreen;

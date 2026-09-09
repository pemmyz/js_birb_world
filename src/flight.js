import { playRingChime } from './audio.js';

export function createPlayerState() {
  return {
    pos: new THREE.Vector3(0, 185, 480),
    yaw: 0.0,
    pitch: 0.0,
    roll: 0.0,
    speed: 14.0,
    steerX: 0,
    steerPitch: 0,
    gatesCleared: 0,
    currentRingIndex: 0,
    reverseOrder: false,
    score: 0,
    finishTime: null,
    intro: {
      active: true,
      elapsed: 0.0,
      duration: 3.5,
      radius: 10.5,
      height: 2.8
    }
  };
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
}

export function updatePlayerPhysics(player, glider, steerInput, playerId, delta, t, invertPitch, vortexRings, onGateCleared, onFinish) {
  let pitchIntent = steerInput.y;
  if (invertPitch) pitchIntent = -pitchIntent;

  player.steerX = THREE.MathUtils.lerp(player.steerX, steerInput.x, delta * 3.5);
  player.steerPitch = THREE.MathUtils.lerp(player.steerPitch, pitchIntent, delta * 3.5);

  player.yaw -= player.steerX * 0.95 * delta;
  player.roll = THREE.MathUtils.lerp(player.roll, -player.steerX * 0.55, delta * 4.0);

  const clampedPitchTarget = THREE.MathUtils.clamp(player.steerPitch * 0.55, -0.65, 0.55);
  player.pitch = THREE.MathUtils.lerp(player.pitch, clampedPitchTarget, delta * 3.8);

  const forwardX = -Math.sin(player.yaw);
  const forwardZ = -Math.cos(player.yaw);

  const currentAirspeed = player.speed - (player.pitch * 5.0);
  player.pos.x += forwardX * currentAirspeed * delta;
  player.pos.z += forwardZ * currentAirspeed * delta;

  const verticalSpeed = (player.pitch * 16.5) - 0.75;
  player.pos.y += verticalSpeed * delta;

  if (player.pos.y < 7.5) player.pos.y = 7.5;

  glider.root.position.copy(player.pos);
  glider.root.rotation.set(0, player.yaw, 0, 'YXZ');
  glider.root.rotateZ(player.roll);
  glider.root.rotateX(player.pitch);

  glider.paragliderGroup.position.y = Math.sin(t * 1.8 + player.pos.x * 0.1) * 0.08;
  glider.birdGroup.rotation.z = -player.roll * 0.65 + Math.sin(t * 1.2) * 0.04;
  glider.birdGroup.rotation.x = Math.sin(t * 1.5) * 0.03;
  glider.canopyGroup.scale.y = 1.0 + Math.sin(t * 2.8) * 0.015;

  glider.root.updateMatrixWorld(true);
  glider.updateRopes();

  const totalGates = vortexRings.length;
  const activeRing = vortexRings[player.currentRingIndex];

  // Ring Pass-Through Checkpoint Detection
  if (activeRing && player.pos.distanceTo(activeRing.pos) < activeRing.radius) {
    playRingChime(playerId === 'p1' ? 1.0 : 1.25);
    player.score += 100;
    player.gatesCleared += 1;

    if (onGateCleared) onGateCleared(playerId);

    if (player.reverseOrder) {
      player.currentRingIndex = (player.currentRingIndex - 1 + totalGates) % totalGates;
    } else {
      player.currentRingIndex = (player.currentRingIndex + 1) % totalGates;
    }

    if (player.gatesCleared >= totalGates && player.finishTime === null) {
      if (onFinish) onFinish(playerId);
    }
  }

  // 3D Directional Guide Arrow
  if (activeRing) {
    const arrowPos = player.pos.clone().add(new THREE.Vector3(0, 3.6, 0));
    glider.arrowAnchor.position.copy(arrowPos);
    glider.arrowMeshGroup.position.y = Math.sin(t * 5.0 + player.pos.x * 0.2) * 0.15;
    glider.arrowMeshGroup.rotation.z = Math.sin(t * 3.5) * 0.15;
    glider.arrowAnchor.lookAt(activeRing.pos);
  }

  return currentAirspeed;
}

export function updatePlayerCamera(camera, player, delta) {
  const forwardX = -Math.sin(player.yaw);
  const forwardZ = -Math.cos(player.yaw);

  const standardChaseOffset = new THREE.Vector3(0, 3.2, 10.5);
  standardChaseOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);
  const targetCamPos = player.pos.clone().add(standardChaseOffset);

  if (player.intro.active) {
    player.intro.elapsed += delta;
    const progress = Math.min(player.intro.elapsed / player.intro.duration, 1.0);
    const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);
    const orbitAngle = player.yaw + Math.PI + (ease * Math.PI * 2);

    const orbitOffset = new THREE.Vector3(
      Math.sin(orbitAngle) * player.intro.radius,
      player.intro.height,
      Math.cos(orbitAngle) * player.intro.radius
    );

    if (progress >= 1.0) {
      player.intro.active = false;
      camera.position.lerp(targetCamPos, delta * 5.0);
    } else {
      camera.position.copy(player.pos.clone().add(orbitOffset));
    }
    camera.lookAt(player.pos.clone().add(new THREE.Vector3(0, 0.6, 0)));
  } else {
    camera.position.lerp(targetCamPos, delta * 4.5);
    const lookAheadPoint = player.pos.clone().add(
      new THREE.Vector3(forwardX * 20, player.pitch * 10 - 1.0, forwardZ * 20)
    );
    camera.lookAt(lookAheadPoint);
  }
}

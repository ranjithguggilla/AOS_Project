const Product = require('./models/Product');
const Component = require('./models/Component');

const products = [
  {
    name: 'Smart Plant Monitor',
    slug: 'smart-plant',
    description:
      'Soil moisture and ambient sensing for houseplants: MCU reads probes, drives a simple display or alerts, and teaches analog sensing + calibration in a compact eco build.',
    price: 34.99,
    image: '/catalog/base-kits/plant.jpg',
    category: 'eco',
    difficulty: 'Beginner',
    countInStock: 10,
  },
  {
    name: 'Line-Follower Robot',
    slug: 'line-follower',
    description:
      'Classic two-motor rover with IR reflectance sensors that tracks a dark line on a light surface—PID-friendly code, servo steering basics, and safe battery practice.',
    price: 59.99,
    image: '/catalog/featured-kits/line_follower_robot.png',
    category: 'robotics',
    difficulty: 'Intermediate',
    countInStock: 8,
  },
  {
    name: 'Arduino Sound Lab',
    slug: 'midi-synth',
    description:
      'Hands-on audio electronics: pots, buttons, and an MCU explore synthesis and sampling—wire modules, map controls in firmware, and hear results through onboard output.',
    price: 44.99,
    image: '/catalog/featured-kits/midi_synth.png',
    category: 'audio',
    difficulty: 'Intermediate',
    countInStock: 12,
  },
  {
    name: 'Eco Craft Lamp',
    slug: 'eco-lamp',
    description:
      'Laser-cut renewable-material panels plus warm LED strip and driver: assemble a desk lamp, learn series power and diffusion, with a low-waste crafts story.',
    price: 29.99,
    image: '/catalog/featured-kits/lamp.png',
    category: 'crafts',
    difficulty: 'Beginner',
    countInStock: 15,
  },
  {
    name: 'Weather Station Kit',
    slug: 'weather-station',
    description:
      'Microcontroller + environment sensors and a crisp display for temperature, humidity, and pressure—log locally, chart trends, and extend with your own API hooks.',
    price: 52.99,
    image: '/catalog/featured-kits/weather_station.png',
    category: 'robotics',
    difficulty: 'Intermediate',
    countInStock: 10,
  },
  {
    name: 'Aurora Tide Clock',
    slug: 'aurora-tide-clock',
    description:
      'Desk sculpture that visualizes local tide phase and moon illumination with a slow disk, edge-lit ring, MCU + RTC, and optional OLED readout.',
    price: 48.99,
    image: '/catalog/featured-kits/aurora_tide_clock.png',
    category: 'crafts',
    difficulty: 'Advanced',
    countInStock: 10,
  },
  {
    name: 'Stratus Glider',
    slug: 'stratus-glider',
    description:
      'EPP foam 2-channel trainer wing with servo elevons, balanced CG, and field-repairable hinges—flight basics without ground-line robots.',
    price: 54.99,
    image: '/catalog/featured-kits/stratus_glider.png',
    category: 'robotics',
    difficulty: 'Advanced',
    countInStock: 8,
  },
  {
    name: 'Cipher Dome',
    slug: 'cipher-dome',
    description:
      'Tabletop optics puzzle: route a safe classroom laser through snap-in mirrors inside a clear dome to hit targets—logic + angles, not security tripwires.',
    price: 42.99,
    image: '/catalog/featured-kits/cipher_dome.png',
    category: 'sensor',
    difficulty: 'Intermediate',
    countInStock: 9,
  },
  {
    name: 'LoomLink',
    slug: 'loom-link',
    description:
      'String-art plotter: steppers drive thread across a pin disk for algorithmic portraits—motion meets craft, distinct from pen plotters.',
    price: 56.99,
    image: '/catalog/featured-kits/loomlink.png',
    category: 'crafts',
    difficulty: 'Intermediate',
    countInStock: 7,
  },
  {
    name: 'HelioTrack',
    slug: 'helio-track',
    description:
      'Single-axis solar panel tracker with light-seeking and metering—servos, photodiodes, and power basics without a weather dashboard.',
    price: 49.99,
    image: '/catalog/featured-kits/helio_track.png',
    category: 'eco',
    difficulty: 'Intermediate',
    countInStock: 10,
  },
  {
    name: 'PulseWeave',
    slug: 'pulse-weave',
    description:
      'Forearm cuff with dry electrodes + IMU: muscle activation drives LED patterns—wearable physiology, not a voice assistant.',
    price: 63.99,
    image: '/catalog/featured-kits/pulse_weave.png',
    category: 'sensor',
    difficulty: 'Advanced',
    countInStock: 6,
  },
  {
    name: 'EchoVault',
    slug: 'echo-vault',
    description:
      'Laser-cut wood enclosure + contact exciter: turn a surface into a resonant speaker—acoustics and impedance, not a slider synth lab.',
    price: 38.99,
    image: '/catalog/featured-kits/echo_vault.png',
    category: 'audio',
    difficulty: 'Beginner',
    countInStock: 12,
  },
  {
    name: 'RiftRover',
    slug: 'rift-rover',
    description:
      'Rocker-bogie mini rover for rough terrain with ultrasonic slow-down—not a line-following track robot.',
    price: 67.99,
    image: '/catalog/featured-kits/rift_rover.png',
    category: 'robotics',
    difficulty: 'Advanced',
    countInStock: 7,
  },
  {
    name: 'CryoSnap',
    slug: 'cryo-snap',
    description:
      'Transparent Stirling-style heat engine demo with temperature probes—motion from a temperature difference, not soil or weather UI.',
    price: 71.99,
    image: '/catalog/featured-kits/cryo_snap.png',
    category: 'sensor',
    difficulty: 'Advanced',
    countInStock: 5,
  },
  {
    name: 'NeonGarden',
    slug: 'neon-garden',
    description:
      'Compact mist-style vertical grow tower with grow LEDs and timers—aeroponics focus, not a soil moisture stick.',
    price: 58.99,
    image: '/catalog/featured-kits/neon_garden.png',
    category: 'eco',
    difficulty: 'Intermediate',
    countInStock: 8,
  },
  {
    name: 'LumaCube',
    slug: 'luma-cube',
    description:
      'Snap-fit frosted acrylic cube with a diffused RGB strip and touch ring: cycle calming presets for a desk or shelf—learn power basics, color mixing, and enclosure fit without soldering.',
    price: 32.99,
    image: '/catalog/featured-kits/luma_cube.png',
    category: 'crafts',
    difficulty: 'Beginner',
    countInStock: 14,
  },
  {
    name: 'BreezeBeacon',
    slug: 'breeze-beacon',
    description:
      'Quiet USB desk fan in a compact recycled-fiber base with a simple temperature LED cue—airflow where you work, gentle intro to sensors and thresholds with a satisfying everyday build.',
    price: 36.99,
    image: '/catalog/featured-kits/breeze_beacon.png',
    category: 'eco',
    difficulty: 'Beginner',
    countInStock: 12,
  },
  {
    name: 'Glow Sentinel',
    slug: 'glow-sentinel',
    description:
      'PIR-activated warm white LED puck for hall or desk: adjust hold time and brightness, mount with adhesive or stand—motion sensing made friendly for first-time makers.',
    price: 33.49,
    image: '/catalog/featured-kits/glow_sentinel.png',
    category: 'sensor',
    difficulty: 'Beginner',
    countInStock: 11,
  },
  {
    name: 'Pixel Pal',
    slug: 'pixel-pal',
    description:
      '8×8 addressable LED matrix in a bamboo desk frame: USB-powered with one-button animation cycles—optional block coding later; instant gratification for patterns and pixel art.',
    price: 37.99,
    image: '/catalog/featured-kits/pixel_pal.png',
    category: 'crafts',
    difficulty: 'Beginner',
    countInStock: 13,
  },
];

const components = [
  { sku: 'MOD-SENSOR-01', name: 'Sensor Pack — IR + Ultrasonic', price: 12.99, category: 'sensor', voltage_volts: 5, image: '/catalog/modules/sensor_modules.png' },
  { sku: 'MOD-MCU-01', name: 'Microcontroller Board — Dev Kit', price: 19.99, category: 'controller', voltage_volts: 5, image: '/catalog/modules/microcontroller_boards.png' },
  { sku: 'MOD-MOTOR-01', name: 'Motor Driver + Wheels', price: 24.99, category: 'motor', voltage_volts: 5, image: '/catalog/modules/robotic_motors.png' },
  { sku: 'MOD-LED-01', name: 'LED Matrix Module', price: 8.99, category: 'led', voltage_volts: 5, image: '/catalog/modules/led_modules.png' },
  { sku: 'MOD-PWR-01', name: 'Power Module — 5V Regulated', price: 7.99, category: 'power', voltage_volts: 5, image: '/catalog/modules/power_modules.png' },
  { sku: 'MOD-PWR-03', name: 'Battery Pack — 3.7V (needs buck)', price: 12.99, category: 'power', voltage_volts: 3, image: '/catalog/modules/power_modules.png' },
  { sku: 'MOD-ECO-01', name: 'Eco Casings Pack', price: 5.99, category: 'enclosure', voltage_volts: 0, image: '/catalog/modules/eco_casings.png' },
  { sku: 'MOD-TOOL-01', name: 'Tool / Add-on Pack', price: 4.99, category: 'tools', voltage_volts: 0, image: '/catalog/modules/tool_addons.png' },
  { sku: 'MOD-LASER-01', name: 'Laser Tripwire Module', price: 15.99, category: 'sensor', voltage_volts: 5, image: '/catalog/modules/laser_tripwire.png' },
  { sku: 'MOD-VOICE-01', name: 'Voice Assistant Module', price: 21.99, category: 'audio', voltage_volts: 5, image: '/catalog/modules/voice_assistant.png' },
];

async function seed() {
  for (const p of products) {
    await Product.findOneAndUpdate({ slug: p.slug }, { $set: p }, { upsert: true, new: true });
  }
  console.log(`Products synced (${products.length})`);

  for (const c of components) {
    await Component.findOneAndUpdate({ sku: c.sku }, { $set: c }, { upsert: true, new: true });
  }
  console.log(`Components synced (${components.length})`);
}

module.exports = seed;

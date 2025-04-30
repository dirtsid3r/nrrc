import type { PuzzleData } from "@/types/puzzle-types"

export const defaultPuzzleData: PuzzleData = [
  {
    id: 1,
    name: "Carbon Intake & Capture",
    type: "passphrase",
    initialMessage:
      "//SYSTEM ALERT: Carbon Intake & Capture system failure detected.\n\n//DIAGNOSTIC: Atmospheric CO₂ vacuum ionization malfunction. Nano-filtration membranes offline.\n\n//ACTION REQUIRED: Enter system override code to recalibrate ionized air vacuums.",
    passphrase: "CAPTURE2023",
    hints: [
      "The code combines the system's primary function with the year of its last maintenance.",
      "The system's primary function relates to 'capturing' something from the atmosphere.",
      "The code format is [FUNCTION][YEAR] with all capital letters.",
    ],
    successMessage:
      "//SYSTEM: Carbon Intake & Capture system successfully recalibrated. Nano-filtration membranes online. CO₂ separation resumed.",
  },
  {
    id: 2,
    name: "Molecular Classification",
    type: "sorting",
    initialMessage:
      "//SYSTEM ALERT: Molecular Classification system malfunction.\n\n//DIAGNOSTIC: Particle sorting algorithms corrupted. Manual classification required.\n\n//ACTION REQUIRED: Sort the following molecular compounds into their correct categories to restore automated classification.\n\n//AVAILABLE COMMANDS:\n- list categories\n- list items\n- assign [item_id] [category]\n- check solution\n- show assignments",
    hints: [
      "Consider the molecular structure and primary function of each compound.",
      "Group compounds by their primary role in carbon recycling.",
      "Pay attention to the chemical properties mentioned in compound descriptions.",
    ],
    items: [
      { id: "CO2", name: "Carbon Dioxide", category: "" },
      { id: "CH4", name: "Methane", category: "" },
      { id: "C2H6", name: "Ethane", category: "" },
      { id: "H2O", name: "Water", category: "" },
      { id: "O2", name: "Oxygen", category: "" },
      { id: "N2", name: "Nitrogen", category: "" },
    ],
    categories: ["Input Gas", "Product Gas", "Catalyst"],
    solution: {
      "Input Gas": ["CO2", "CH4", "C2H6"],
      "Product Gas": ["O2"],
      "Catalyst": ["H2O", "N2"],
    },
    successMessage:
      "//SYSTEM: Molecular Classification system restored. Automated sorting algorithms recalibrated. Classification efficiency at optimal levels.",
  },
  {
    id: 3,
    name: "Molecular Disassembly",
    type: "passphrase",
    initialMessage:
      "//SYSTEM ALERT: Molecular Disassembly chamber malfunctioning.\n\n//DIAGNOSTIC: High-frequency laser alignment error. Quantum resonance fields unstable.\n\n//ACTION REQUIRED: Input correct frequency modulation sequence to stabilize plasma separation chamber.",
    passphrase: "LASER1420",
    hints: [
      "The sequence relates to the primary tool used in the disassembly process and its optimal frequency.",
      "The tool that breaks down CO₂ molecules operates at a specific frequency measured in MHz.",
      "The sequence format is [TOOL][FREQUENCY] with the tool in all capital letters.",
    ],
    successMessage:
      "//SYSTEM: Molecular Disassembly chamber stabilized. Laser alignment corrected. CO₂ molecules successfully breaking down into carbon and oxygen.",
  },
  {
    id: 4,
    name: "Nuclear Energy Core Activation",
    type: "passphrase",
    initialMessage:
      "//SYSTEM ALERT: Nuclear Energy Core offline.\n\n//DIAGNOSTIC: Thorium-based molten salt reactor cooling system compromised.\n\n//ACTION REQUIRED: Enter core restart sequence to reinitiate controlled reaction.",
    passphrase: "THORIUM232",
    hints: [
      "The sequence relates to the primary element used in the reactor and its atomic mass.",
      "The element used in the molten salt reactor is a radioactive metal named after a Norse god of thunder.",
      "The sequence format is [ELEMENT][ATOMIC_MASS] with the element in all capital letters.",
    ],
    successMessage:
      "//SYSTEM: Nuclear Energy Core successfully reactivated. Thorium reaction stable. Power output normalized.",
  },
  {
    id: 5,
    name: "Isotopic Reformation",
    type: "passphrase",
    initialMessage:
      "//SYSTEM ALERT: Isotopic Reformation chamber malfunction.\n\n//DIAGNOSTIC: Magnetic field generator offline. Neutron bath contamination detected.\n\n//ACTION REQUIRED: Input magnetic field calibration code to restore carbon atom rearrangement.",
    passphrase: "MAGNET3.7T",
    hints: [
      "The code relates to the device generating the field and its optimal strength measured in Tesla.",
      "The device that creates the field for carbon atom rearrangement is electromagnetic in nature.",
      "The code format is [DEVICE][STRENGTH] with the device in all capital letters and strength including decimal point.",
    ],
    successMessage:
      "//SYSTEM: Isotopic Reformation chamber recalibrated. Magnetic field restored. Carbon atom rearrangement proceeding normally.",
  },
  {
    id: 6,
    name: "Cryogenic Carbon Storage",
    type: "passphrase",
    initialMessage:
      "//SYSTEM ALERT: Cryogenic Carbon Storage system failure.\n\n//DIAGNOSTIC: High-pressure cryogenic vault temperature rising. Nano-lattice structure integrity compromised.\n\n//ACTION REQUIRED: Enter temperature regulation override to stabilize storage conditions.",
    passphrase: "CRYO-196C",
    hints: [
      "The override code relates to the storage method and the optimal temperature for liquid nitrogen in Celsius.",
      "Liquid nitrogen is commonly used in cryogenic applications and has a specific boiling point.",
      "The code format is [PREFIX]-[TEMPERATURE]C with the prefix in all capital letters and temperature as a negative number.",
    ],
    successMessage:
      "//SYSTEM: Cryogenic Carbon Storage system stabilized. Vault temperature normalized. Nano-lattice structure integrity restored.",
  },
  {
    id: 7,
    name: "Synthetic Fuel Fabrication",
    type: "passphrase",
    initialMessage:
      "//SYSTEM ALERT: Synthetic Fuel Fabrication unit malfunction.\n\n//DIAGNOSTIC: Catalytic converter efficiency at critical levels. Hydrogen bonding process interrupted.\n\n//ACTION REQUIRED: Input catalyst reactivation sequence to resume carbon-hydrogen bonding.",
    passphrase: "CATALYST-PT78",
    hints: [
      "The sequence relates to the type of material used in the catalytic converter and its atomic number.",
      "The catalyst used in many industrial processes is a precious metal in the platinum group.",
      "The sequence format is [TYPE]-[ELEMENT][ATOMIC_NUMBER] with the type and element abbreviation in all capital letters.",
    ],
    successMessage:
      "//SYSTEM: Synthetic Fuel Fabrication unit restored. Catalytic converter efficiency optimized. Carbon-hydrogen bonding resumed.",
  },
  {
    id: 8,
    name: "Closed-loop Energy Distribution",
    type: "passphrase",
    initialMessage:
      "//SYSTEM ALERT: Closed-loop Energy Distribution network failure.\n\n//DIAGNOSTIC: Distribution node connectivity compromised. Carbon loop feedback interrupted.\n\n//ACTION REQUIRED: Enter network reconfiguration code to restore distribution pathways.",
    passphrase: "LOOP-CONFIG42",
    hints: [
      "The code relates to the system's configuration and the number of distribution nodes in the network.",
      "The system operates as a closed circuit that needs to be reconfigured to its original state.",
      "The code format is [TYPE]-[ACTION][NUMBER] with type and action in all capital letters.",
    ],
    successMessage:
      "//SYSTEM: Closed-loop Energy Distribution network reconfigured. Node connectivity restored. Carbon loop feedback resumed.",
  },
  {
    id: 9,
    name: "Waste Reclamation & Reactor Cooling",
    type: "passphrase",
    initialMessage:
      "//SYSTEM ALERT: Waste Reclamation & Reactor Cooling system failure.\n\n//DIAGNOSTIC: Graphene-based thermal recapture system overheating. Water purification units offline.\n\n//ACTION REQUIRED: Enter thermal regulation sequence to restore heat dissipation.",
    passphrase: "GRAPHENE-K2400",
    hints: [
      "The sequence relates to the material used in the thermal recapture system and its thermal conductivity measured in W/mK.",
      "The material used is a form of carbon arranged in a single layer of atoms in a hexagonal lattice.",
      "The sequence format is [MATERIAL]-K[CONDUCTIVITY] with the material in all capital letters.",
    ],
    successMessage:
      "//SYSTEM: Waste Reclamation & Reactor Cooling system restored. Thermal recapture functioning normally. Water purification units online.",
  },
  {
    id: 10,
    name: "AI-Controlled Ecosystem Balance",
    type: "passphrase",
    initialMessage:
      "//SYSTEM ALERT: AI-Controlled Ecosystem Balance system offline.\n\n//DIAGNOSTIC: Central AI core processing error. Environmental monitoring interrupted.\n\n//ACTION REQUIRED: Enter AI reboot sequence with administrator credentials to restore ecosystem monitoring.",
    passphrase: "ADMIN-GAIA2100",
    hints: [
      "The sequence combines the access level required and the AI's designation along with its version number.",
      "The AI is named after the ancient Greek goddess of the Earth, representing its role in maintaining ecosystem balance.",
      "The sequence format is [ACCESS]-[NAME][VERSION] with access and name in all capital letters.",
    ],
    successMessage:
      "//SYSTEM: AI-Controlled Ecosystem Balance system restored. Central AI core online. Environmental monitoring resumed.\n\n//FINAL STATUS: All reactor systems operational. Nuclear Recycling Reactor functioning at optimal capacity. Carbon neutrality achieved. Congratulations, team!",
  },
]

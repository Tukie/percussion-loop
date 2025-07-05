const instrumentList = [
  {
    id: 'sound_1',
    note: 'A0',
    label: 'Sound 1',
    color: 'bg-red-500',
    url: 'sound_1.wav',
    pitch: 0,
    volume: -20,
  },
  {
    id: 'sound_2',
    note: 'A1',
    label: 'Sound 2',
    color: 'bg-red-500',
    url: 'sound_2.wav',
    pitch: 0,
    volume: -20,
  },
  {
    id: 'charp',
    note: 'A2',
    label: 'Charp',
    color: 'bg-red-500',
    url: 'charp.wav',
    pitch: 0,
    volume: -20,
  },
  {
    id: 'ching',
    note: 'A3',
    label: 'Ching',
    color: 'bg-orange-500',
    url: 'ching.wav',
    pitch: 0,
    volume: -20,
  },
  {
    id: 'tambourine',
    note: 'A4',
    label: 'Tambourine',
    color: 'bg-pink-500',
    url: 'tambourine.wav',
    pitch: 0,
    volume: -20,
  },

  {
    id: 'cowbell',
    note: 'A5',
    label: 'Cowbell',
    color: 'bg-blue-500',
    url: 'cow_low.wav',
    pitch: 0,
    volume: -20,
  },
  {
    id: 'slapConga',
    note: 'A6',
    label: 'Slap Conga',
    color: 'bg-green-500',
    url: 'conga_3.wav',
    pitch: 0,
    volume: -20,
  },
  {
    id: 'openHandConga',
    note: 'A7',
    label: 'Open Hand Conga',
    color: 'bg-green-500',
    url: 'conga_2.wav',
    pitch: 0,
    volume: -20,
  },
  {
    id: 'hiconga',
    note: 'A8',
    label: 'Hi Conga',
    color: 'bg-green-500',
    url: 'hi_conga.wav',
    pitch: 0,
    volume: -20,
  },

  {
    id: 'lowconga',
    note: 'A9',
    label: 'Low Conga',
    color: 'bg-yellow-500',
    url: 'low_conga.wav',
    pitch: 0,
    volume: -20,
  },
]

const getGetInstrument = () => {
  return instrumentList
}

export { getGetInstrument }

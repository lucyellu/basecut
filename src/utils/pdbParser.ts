export interface PDBData {
  backbone: Array<{ x: number; y: number; z: number; index: number }>;
  ligands: Array<{ x: number; y: number; z: number }>;
  edges: Array<[number, number]>;
}

export function parsePDB(pdbText: string): PDBData {
  const lines = pdbText.split('\n');
  const backbone: PDBData['backbone'] = [];
  const ligands: PDBData['ligands'] = [];
  const edges: PDBData['edges'] = [];
  
  const serialToIndex = new Map<number, number>();

  for (const line of lines) {
    if (line.startsWith('ATOM  ')) {
      const serial = parseInt(line.substring(6, 11).trim(), 10);
      const x = parseFloat(line.substring(30, 38).trim());
      const y = parseFloat(line.substring(38, 46).trim());
      const z = parseFloat(line.substring(46, 54).trim());
      
      const index = backbone.length;
      backbone.push({ x, y, z, index });
      serialToIndex.set(serial, index);
      
    } else if (line.startsWith('HETATM')) {
      const x = parseFloat(line.substring(30, 38).trim());
      const y = parseFloat(line.substring(38, 46).trim());
      const z = parseFloat(line.substring(46, 54).trim());
      ligands.push({ x, y, z });
      
    } else if (line.startsWith('CONECT')) {
      const serial1 = parseInt(line.substring(6, 11).trim(), 10);
      const idx1 = serialToIndex.get(serial1);
      
      if (idx1 !== undefined) {
        const fields = [
          line.substring(11, 16).trim(),
          line.substring(16, 21).trim(),
          line.substring(21, 26).trim(),
          line.substring(26, 31).trim()
        ];
        
        for (const field of fields) {
          if (field) {
            const serial2 = parseInt(field, 10);
            const idx2 = serialToIndex.get(serial2);
            if (idx2 !== undefined) {
              if (idx1 < idx2) {
                edges.push([idx1, idx2]);
              }
            }
          }
        }
      }
    }
  }

  return { backbone, ligands, edges };
}

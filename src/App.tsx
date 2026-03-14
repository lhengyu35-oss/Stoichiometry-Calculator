import React, { useState, useMemo } from 'react';
import { ArrowRight, Calculator, AlertCircle, FlaskConical, Scale, Info } from 'lucide-react';

const PERIODIC_TABLE: Record<string, number> = {
  "H": 1.008, "He": 4.0026, "Li": 6.94, "Be": 9.0122, "B": 10.81, "C": 12.011, "N": 14.007, "O": 15.999, "F": 18.998, "Ne": 20.180,
  "Na": 22.990, "Mg": 24.305, "Al": 26.982, "Si": 28.085, "P": 30.974, "S": 32.06, "Cl": 35.45, "Ar": 39.948,
  "K": 39.098, "Ca": 40.078, "Sc": 44.956, "Ti": 47.867, "V": 50.942, "Cr": 51.996, "Mn": 54.938, "Fe": 55.845, "Co": 58.933, "Ni": 58.693, "Cu": 63.546, "Zn": 65.38, "Ga": 69.723, "Ge": 72.630, "As": 74.922, "Se": 78.971, "Br": 79.904, "Kr": 83.798,
  "Rb": 85.468, "Sr": 87.62, "Y": 88.906, "Zr": 91.224, "Nb": 92.906, "Mo": 95.95, "Tc": 98, "Ru": 101.07, "Rh": 102.91, "Pd": 106.42, "Ag": 107.87, "Cd": 112.41, "In": 114.82, "Sn": 118.71, "Sb": 121.76, "Te": 127.60, "I": 126.90, "Xe": 131.29,
  "Cs": 132.91, "Ba": 137.33, "La": 138.91, "Ce": 140.12, "Pr": 140.91, "Nd": 144.24, "Pm": 145, "Sm": 150.36, "Eu": 151.96, "Gd": 157.25, "Tb": 158.93, "Dy": 162.50, "Ho": 164.93, "Er": 167.26, "Tm": 168.93, "Yb": 173.05, "Lu": 174.97,
  "Hf": 178.49, "Ta": 180.95, "W": 183.84, "Re": 186.21, "Os": 190.23, "Ir": 192.22, "Pt": 195.08, "Au": 196.97, "Hg": 200.59, "Tl": 204.38, "Pb": 207.2, "Bi": 208.98, "Po": 209, "At": 210, "Rn": 222,
  "Fr": 223, "Ra": 226, "Ac": 227, "Th": 232.04, "Pa": 231.04, "U": 238.03, "Np": 237, "Pu": 244, "Am": 243, "Cm": 247, "Bk": 247, "Cf": 251, "Es": 252, "Fm": 257, "Md": 258, "No": 259, "Lr": 266,
  "Rf": 267, "Db": 268, "Sg": 269, "Bh": 270, "Hs": 277, "Mt": 278, "Ds": 281, "Rg": 282, "Cn": 285, "Nh": 286, "Fl": 289, "Mc": 290, "Lv": 293, "Ts": 294, "Og": 294
};

function parseNumber(str: string): number {
    if (!str) return 1;
    if (str.includes('/')) {
        let parts = str.split('/');
        return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(str);
}

function parseFormula(formula: string) {
    let stack: Record<string, number>[] = [{}];
    let i = 0;
    while (i < formula.length) {
        let char = formula[i];
        if (char === '(' || char === '[') {
            stack.push({});
            i++;
        } else if (char === ')' || char === ']') {
            let top = stack.pop()!;
            i++;
            let count = '';
            while (i < formula.length && /[0-9./]/.test(formula[i])) {
                count += formula[i];
                i++;
            }
            let multiplier = count === '' ? 1 : parseNumber(count);
            let current = stack[stack.length - 1];
            for (let [elem, val] of Object.entries(top)) {
                current[elem] = (current[elem] || 0) + val * multiplier;
            }
        } else if (/[A-Z]/.test(char)) {
            let elem = char;
            i++;
            while (i < formula.length && /[a-z]/.test(formula[i])) {
                elem += formula[i];
                i++;
            }
            let count = '';
            while (i < formula.length && /[0-9./]/.test(formula[i])) {
                count += formula[i];
                i++;
            }
            let multiplier = count === '' ? 1 : parseNumber(count);
            let current = stack[stack.length - 1];
            current[elem] = (current[elem] || 0) + multiplier;
        } else {
            i++;
        }
    }
    return stack[0];
}

function parseCompound(compound: string) {
    let parts = compound.split(/[\*·]/);
    let total: Record<string, number> = {};
    for (let part of parts) {
        part = part.trim();
        if (!part) continue;
        let multiplier = 1;
        let match = part.match(/^([0-9./]+)(.*)/);
        if (match) {
            multiplier = parseNumber(match[1]);
            part = match[2];
        }
        let parsed = parseFormula(part);
        for (let [elem, val] of Object.entries(parsed)) {
            total[elem] = (total[elem] || 0) + val * multiplier;
        }
    }
    return total;
}

function calculateMolarMass(parsedCompound: Record<string, number>) {
    let mass = 0;
    for (let [elem, count] of Object.entries(parsedCompound)) {
        if (PERIODIC_TABLE[elem]) {
            mass += PERIODIC_TABLE[elem] * count;
        } else {
            throw new Error(`Unknown element: ${elem}`);
        }
    }
    return mass;
}

function cleanFormula(formula: string) {
    return formula.trim().replace(/^[\d\s]+/, '');
}

function balanceEquation(reactants: string[], products: string[]) {
    let elements = new Set<string>();
    let matrix: number[][] = [];
    let compounds = [...reactants, ...products];
    let parsedCompounds = compounds.map(parseCompound);
    
    parsedCompounds.forEach(c => {
        Object.keys(c).forEach(e => elements.add(e));
    });
    
    let reactElements = new Set<string>();
    reactants.map(parseCompound).forEach(c => Object.keys(c).forEach(e => reactElements.add(e)));
    let prodElements = new Set<string>();
    products.map(parseCompound).forEach(c => Object.keys(c).forEach(e => prodElements.add(e)));
    
    for (let e of reactElements) {
        if (!prodElements.has(e)) throw new Error(`Element ${e} is in reactants but not in products.`);
    }
    for (let e of prodElements) {
        if (!reactElements.has(e)) throw new Error(`Element ${e} is in products but not in reactants.`);
    }
    
    let elementArray = Array.from(elements);
    
    for (let i = 0; i < elementArray.length; i++) {
        let row = [];
        for (let j = 0; j < compounds.length; j++) {
            let count = parsedCompounds[j][elementArray[i]] || 0;
            if (j >= reactants.length) count = -count;
            row.push(count);
        }
        matrix.push(row);
    }
    
    let rows = matrix.length;
    let cols = compounds.length;
    
    let lead = 0;
    for (let r = 0; r < rows; r++) {
        if (cols <= lead) break;
        let i = r;
        while (Math.abs(matrix[i][lead]) < 1e-10) {
            i++;
            if (rows == i) {
                i = r;
                lead++;
                if (cols == lead) break;
            }
        }
        if (cols == lead) break;
        
        let temp = matrix[i];
        matrix[i] = matrix[r];
        matrix[r] = temp;
        
        let val = matrix[r][lead];
        for (let j = 0; j < cols; j++) {
            matrix[r][j] /= val;
        }
        
        for (let i = 0; i < rows; i++) {
            if (i != r) {
                let val = matrix[i][lead];
                for (let j = 0; j < cols; j++) {
                    matrix[i][j] -= val * matrix[r][j];
                }
            }
        }
        lead++;
    }
    
    let pivotCols = [];
    let freeCols = [];
    let r = 0;
    for (let c = 0; c < cols; c++) {
        if (r < rows && Math.abs(matrix[r][c] - 1) < 1e-10) {
            let isPivot = true;
            for (let i = 0; i < rows; i++) {
                if (i != r && Math.abs(matrix[i][c]) > 1e-10) isPivot = false;
            }
            if (isPivot) {
                pivotCols.push(c);
                r++;
            } else {
                freeCols.push(c);
            }
        } else {
            freeCols.push(c);
        }
    }
    
    if (freeCols.length !== 1) {
        throw new Error("Equation cannot be balanced uniquely. Please check your formulas.");
    }
    
    let freeCol = freeCols[0];
    let solution = new Array(cols).fill(0);
    solution[freeCol] = 1;
    
    for (let r = 0; r < pivotCols.length; r++) {
        let c = pivotCols[r];
        solution[c] = -matrix[r][freeCol];
    }
    
    let maxDenominator = 1000;
    let bestMultiplier = 1;
    let minError = Infinity;
    
    for (let m = 1; m <= maxDenominator; m++) {
        let error = 0;
        for (let val of solution) {
            let scaled = val * m;
            error += Math.abs(scaled - Math.round(scaled));
        }
        if (error < minError) {
            minError = error;
            bestMultiplier = m;
            if (error < 1e-8) break;
        }
    }
    
    let intSolution = solution.map(val => Math.round(val * bestMultiplier));
    
    if (intSolution[0] < 0) {
        intSolution = intSolution.map(x => -x);
    }
    
    if (intSolution.some(x => x <= 0)) {
        throw new Error("Invalid equation: some coefficients are zero or negative.");
    }
    
    let gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    let currentGcd = intSolution[0];
    for (let i = 1; i < intSolution.length; i++) {
        currentGcd = gcd(currentGcd, intSolution[i]);
    }
    
    intSolution = intSolution.map(x => x / currentGcd);
    
    return intSolution;
}

interface Reactant {
    formula: string;
    coeff: number;
    molarMass: number;
    excess: number;
}

interface Product {
    formula: string;
    coeff: number;
    molarMass: number;
}

export default function App() {
  const [reactantsInput, setReactantsInput] = useState('Li2CO3 + FePO4 + C6H12O6');
  const [productsInput, setProductsInput] = useState('LiFePO4 + CO2 + H2O');
  const [error, setError] = useState('');
  
  const [reactants, setReactants] = useState<Reactant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isBalanced, setIsBalanced] = useState(false);
  
  const [targetProductIndex, setTargetProductIndex] = useState(0);
  const [targetValue, setTargetValue] = useState<number | ''>(100);
  const [targetInputType, setTargetInputType] = useState<'mass' | 'moles'>('mass');

  const handleBalance = () => {
    setError('');
    try {
      let rStrs = reactantsInput.split(/[+,，]/).map(cleanFormula).filter(Boolean);
      let pStrs = productsInput.split(/[+,，]/).map(cleanFormula).filter(Boolean);
      
      if (rStrs.length === 0 || pStrs.length === 0) {
        throw new Error("Please enter both reactants and products.");
      }
      
      let coeffs = balanceEquation(rStrs, pStrs);
      
      let newReactants = rStrs.map((f, i) => ({
        formula: f,
        coeff: coeffs[i],
        molarMass: calculateMolarMass(parseCompound(f)),
        excess: 0
      }));
      
      let newProducts = pStrs.map((f, i) => ({
        formula: f,
        coeff: coeffs[rStrs.length + i],
        molarMass: calculateMolarMass(parseCompound(f))
      }));
      
      setReactants(newReactants);
      setProducts(newProducts);
      setTargetProductIndex(0);
      setIsBalanced(true);
    } catch (err: any) {
      setError(err.message || 'Failed to balance equation.');
      setIsBalanced(false);
    }
  };

  const results = useMemo(() => {
    if (!isBalanced || products.length === 0 || targetValue === '') return null;
    
    const targetProduct = products[targetProductIndex];
    if (!targetProduct) return null;
    
    const targetMoles = targetInputType === 'mass' 
      ? Number(targetValue) / targetProduct.molarMass 
      : Number(targetValue);
      
    const targetMassCalc = targetInputType === 'mass'
      ? Number(targetValue)
      : Number(targetValue) * targetProduct.molarMass;
    
    const precursors = reactants.map(r => {
      const requiredMoles = targetMoles * (r.coeff / targetProduct.coeff);
      const theoreticalMass = requiredMoles * r.molarMass;
      const actualMass = theoreticalMass * (1 + r.excess / 100);
      
      return {
        ...r,
        requiredMoles,
        theoreticalMass,
        actualMass
      };
    });

    return { precursors, targetMoles, targetMassCalc };
  }, [isBalanced, reactants, products, targetProductIndex, targetValue, targetInputType]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stoichiometry Calculator</h1>
            <p className="text-slate-500">Calculate precursor masses for your chemical reactions</p>
          </div>
        </div>

        {/* Step 1: Equation Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
            Chemical Equation
          </h2>
          
          <div className="mb-6 p-3 bg-blue-50 text-blue-700 rounded-lg flex items-start text-sm">
            <Info className="w-5 h-5 mr-2 flex-shrink-0" />
            <div className="space-y-1">
              <p>1. 请严格按照元素的标准大小写格式来输入，比较案例：比较：Co - 钴 和 CO - 一氧化碳</p>
              <p>2. 含结晶水的化学物请用·（中点）或*（星号）来连接水分子，如CuSO4*5H2O或CuSO4·5H2O</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reactants (Precursors)</label>
              <input 
                type="text" 
                value={reactantsInput}
                onChange={e => setReactantsInput(e.target.value)}
                placeholder="e.g. Li2CO3 + FePO4 + C6H12O6"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="hidden md:flex justify-center mt-6">
              <ArrowRight className="text-slate-400" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Products</label>
              <input 
                type="text" 
                value={productsInput}
                onChange={e => setProductsInput(e.target.value)}
                placeholder="e.g. LiFePO4 + CO2 + H2O"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleBalance}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Balance Equation
            </button>
          </div>
        </div>

        {/* Step 2 & 3: Configuration and Results */}
        {isBalanced && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Configuration */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                  Parameters
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Balanced Equation</label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono text-lg overflow-x-auto whitespace-nowrap">
                      {reactants.map(r => `${r.coeff === 1 ? '' : r.coeff}${r.formula}`).join(' + ')}
                      {' ➔ '}
                      {products.map(p => `${p.coeff === 1 ? '' : p.coeff}${p.formula}`).join(' + ')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Product</label>
                    <select 
                      value={targetProductIndex}
                      onChange={e => setTargetProductIndex(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {products.map((p, i) => (
                        <option key={i} value={i}>{p.formula}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount</label>
                    <div className="flex">
                      <input 
                        type="number" 
                        min="0"
                        step="any"
                        value={targetValue}
                        onChange={e => setTargetValue(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-2 rounded-l-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <select
                        value={targetInputType}
                        onChange={e => setTargetInputType(e.target.value as 'mass' | 'moles')}
                        className="px-4 py-2 rounded-r-xl border border-l-0 border-slate-300 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="mass">Mass (g)</option>
                        <option value="moles">Moles (mol)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Excess Ratios (%)</label>
                    <div className="space-y-3">
                      {reactants.map((r, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{r.formula}</span>
                          <div className="flex items-center w-32">
                            <input 
                              type="number" 
                              min="0"
                              step="any"
                              value={r.excess}
                              onChange={e => {
                                const newReactants = [...reactants];
                                newReactants[i].excess = Number(e.target.value);
                                setReactants(newReactants);
                              }}
                              className="w-full px-3 py-1.5 text-right rounded-l-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <span className="px-3 py-1.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                  Required Precursors
                </h2>
                
                {results && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.precursors.map((r, i) => (
                        <div key={i} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Scale className="w-12 h-12" />
                          </div>
                          <div className="text-sm text-emerald-800 font-medium mb-1 font-mono">{r.formula}</div>
                          <div className="text-3xl font-bold text-emerald-900 mb-2">
                            {r.actualMass.toFixed(4)} <span className="text-base font-normal text-emerald-700">g</span>
                          </div>
                          <div className="text-xs text-emerald-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Theoretical:</span>
                              <span>{r.theoreticalMass.toFixed(4)} g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Required Moles:</span>
                              <span>{r.requiredMoles.toFixed(4)} mol</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Excess:</span>
                              <span>{r.excess}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Molar Mass:</span>
                              <span>{r.molarMass.toFixed(2)} g/mol</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-medium text-slate-700 mb-3">Calculation Summary</h3>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span>Target Product:</span>
                          <span className="font-mono font-medium">{products[targetProductIndex].formula}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Molar Mass:</span>
                          <span>{products[targetProductIndex].molarMass.toFixed(2)} g/mol</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Moles:</span>
                          <span>{results.targetMoles.toFixed(4)} mol</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Mass:</span>
                          <span>{results.targetMassCalc.toFixed(4)} g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Author Badge */}
      <div className="fixed bottom-4 left-4 text-sm text-slate-400 font-medium z-50">
        Author: Peanut_Liu
      </div>
    </div>
  );
}

import * as solc from "solc";
import * as fs from "fs";
import * as path from "path";

const CONTRACTS_DIR = path.join(__dirname, "..", "contracts");
const ARTIFACTS_DIR = path.join(__dirname, "..", "artifacts");

function findImports(importPath: string) {
  const ozBase = path.join(__dirname, "..", "node_modules", importPath);
  if (fs.existsSync(ozBase)) {
    return { contents: fs.readFileSync(ozBase, "utf8") };
  }
  return { error: `File not found: ${importPath}` };
}

const contractFiles = fs.readdirSync(CONTRACTS_DIR).filter((f) => f.endsWith(".sol"));

const sources: Record<string, { content: string }> = {};
for (const file of contractFiles) {
  sources[file] = { content: fs.readFileSync(path.join(CONTRACTS_DIR, file), "utf8") };
}

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object"] },
    },
  },
};

console.log("Compiling contracts...");
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  for (const err of output.errors) {
    if (err.severity === "error") {
      console.error(err.formattedMessage);
      process.exit(1);
    } else {
      console.warn(err.formattedMessage);
    }
  }
}

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

for (const file of Object.keys(output.contracts ?? {})) {
  for (const name of Object.keys(output.contracts[file])) {
    const contract = output.contracts[file][name];
    const artifact = {
      contractName: name,
      abi: contract.abi,
      bytecode: "0x" + contract.evm.bytecode.object,
    };
    const outPath = path.join(ARTIFACTS_DIR, `${name}.json`);
    fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2));
    console.log(`  ${name} -> artifacts/${name}.json`);
  }
}

console.log("\nCompilation complete!");

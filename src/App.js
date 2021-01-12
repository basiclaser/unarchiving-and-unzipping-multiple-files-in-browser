import React, { useEffect, useState } from "react";
import untar from "js-untar";
const pako = require("pako");

// fetch everything DONE
// "unarchive" DONE
// for each unarchived file, ungzip it DONE
// for each ungzipped file, find the correct line of text, save to object with key=filename, value=value of matching

export default function App() {
  const [a, b] = useState([]);
  const [desiredGene, setDesiredGene] = useState("ENSG00000164114.17");
  const [results, setResults] = useState([]);

  const unarchive = async function (stuff) {
    // console.log(stuff);
    let unzippedFiles = [];
    await untar(stuff).progress(function (extractedFile) {
      // console.log(extractedFile);
      const newFileOutput = pako.ungzip(extractedFile.buffer, {
        to: "string",
      });
      unzippedFiles.push({ [extractedFile.name]: newFileOutput });
    });
    return unzippedFiles;
  };

  useEffect(() => {
    fetch("https://api.gdc.cancer.gov/data?tarfile", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: [
          "95e6e420-6b86-4034-aa6c-369c38c8840a",
          "c8546523-a711-4b5f-97ff-7a3c6ca9413f",
          "e62a1625-73f9-49e4-9922-d15a6e18ee72",
          "72accbef-4357-45e3-9d31-5dd4eb8d3ded",
          "2a88aff5-a29d-434a-9859-c60f47bcf75e",
          "9cf14ffd-734b-4fd2-9420-b9bc9f0aab10",
          "c8b151d7-1e83-42b2-bca0-153c0a81e0fa",
          "cb3d8e55-0e4b-43a1-8b5f-f27e7f9f440a",
          "ad431459-b16a-4ec0-add9-2b5f5999eb91",
          "156eaaf6-96ce-44e9-9fa3-6f1db0399332",
        ],
      }),
    })
      .then((r) => r.arrayBuffer())
      .then((r) => unarchive(r, "test-download.tar.gz"))
      .then((files) => {
        console.log(files);
        setResults(
          files.map((file) => {
            console.log(Object.keys(file)[0], Object.values(file)[0]);
            var fileLines = Object.values(file)[0].split("\n");
            for (var i = 0; i < fileLines.length; i++) {
              var y = fileLines[i].split("\t");
              if (y[0] === desiredGene) {
                return { [Object.keys(file)[0]]: y[1] };
              }
            }
          })
        );
      });
  }, []);
  return (
    <div className="App">
      {desiredGene}
      {results.map((r) => (
        <li>
          {Object.keys(r)[0]} {Object.values(r)[0]}
        </li>
      ))}
    </div>
  );
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function areArraysEqual(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((element) => {
      return !!array2.includes(element);
    });
  }

  return false;
}

//HIGHLIGHT TEXT WITH SEARCH TERM
function highlightText(input: string, fontWeight: number, highlightTerm: string) {
  if (highlightTerm === "") return input;

  let startIndex = input.toLowerCase().indexOf(highlightTerm.toLowerCase());
  if (startIndex >= 0) {
    let endIndex = startIndex + highlightTerm.length;
    return (
      <span>
        {input.slice(0, startIndex).toString()}
        <span
          style={{
            fontWeight: fontWeight + 200,
            textDecoration: "underline",
          }}
        >
          {input.slice(startIndex, endIndex).toString()}
        </span>
        {input.slice(endIndex).toString()}
      </span>
    );
  } else {
    return input;
  }
}

function formatFileSize(sizeInByte: number) {
  let sizeInKb = sizeInByte / 1024;
  let sizeInMb = sizeInKb / 1024;
  if (sizeInMb < 1) {
    return `${sizeInKb.toFixed(1)} KB`;
  } else if (sizeInMb < 1024) {
    return `${sizeInMb.toFixed(2)} MB`;
  } else {
    let sizeInGb = sizeInMb / 1024;
    return `${sizeInGb.toFixed(2)} GB`;
  }
}

function toCamelCase(string: string) {
  return string
    .split(" ")
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

const HelperFunctions = {
  toCamelCase,
  areArraysEqual,
  randomIntFromInterval,
  highlightText,
  formatFileSize,
};

export default HelperFunctions;

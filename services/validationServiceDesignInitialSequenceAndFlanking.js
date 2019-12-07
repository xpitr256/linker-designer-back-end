
const aminoAcids = [
  "A",
  "R",
  "N",
  "D",
  "B",
  "C",
  "E",
  "Q",
  "Z",
  "G",
  "H",
  "I",
  "L",
  "K",
  "M",
  "F",
  "P",
  "S",
  "T",
  "W",
  "Y",
  "V"
];

/**
 * Returns true | false according to fasta validations
 */
function isValidFasta(sequence) {
  if (!sequence) {
    return false;
  }
  const lines = sequence.value.toString().split("\n");
  const linesWithoutComments = lines.filter(line => !line.startsWith(">"));
  const allContent = linesWithoutComments.join("").trim();
  if (!allContent) {
    return false;
  }
  for (const aminoAcid of allContent) {
    if (!aminoAcids.includes(aminoAcid)) {
      return false;
    }
  }

  return true;
}
function validateEmail(inputText) {
  const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return mailFormat.test(String(inputText).toLowerCase());
}

function isValidMail (mail) {

  if (isEmpty(mail)){
    return false;
  }

  return validateEmail(mail);
}
function isEmpty(input){

  if(!input){
    return true;
  }

  return input.trim().length === 0;
}

function isInt(value) {
  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value));
}

function isPositiveNumber(value){
  return  !!(isInt(value) && value > 0);
}

module.exports = {

  validate: function (body) {
    return isValidMail(body.email) && isValidFasta(body.flankingSequence1) && isValidFasta(body.flankingSequence2) && isValidFasta(body.initialSequence) && isPositiveNumber(body.distance);
  }
};
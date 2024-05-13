module.exports = (node, graph) => {
  // This node will take your name as input parameter and display alert message
  // repating it N-times


  // Input name of type string
  const nameIn = node.in("name", "");

  // repeatNumber of type Number
  const repeatNumberIn = node.in("repeatNumber", 1, {
    min: 0,
    max: 10,
    // round number to 0 digits after the decimal point
    // effectively allowing only integers as a value
    precision: 0
  });

  // Because second parameter (default value) is a function this will display
  // a button in the inspector. Clicking the button will call provided function.
  const sayItBtn = node.in("Say it!", sayIt);

  let message = "";

  function sayIt() {
    node.comment = message//.replace(/! /g, '\n');
    node.log(message);
    alert(message)
  }

  function update() {
    const name = nameIn.value
    const repeatNumber = repeatNumberIn.value
    
    message = `Hello ${name}! `.repeat(repeatNumber);
  }

  nameIn.onChange = update;
  repeatNumberIn.onChange = update;
};

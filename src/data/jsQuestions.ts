import type { FlashcardItem } from '../types';

export const jsQuestions: FlashcardItem[] = [
  {
    id: 'js-1',
    question: 'What is the difference between the keywords let and var?',
  },
  {
    id: 'js-2',
    question: 'Are these operations valid on const objects and const arrays?',
    code: `// Object mutations:
const obj = {b: 2};
obj.a = 1;
delete obj.a;
obj.b = 3;

// Array mutations:
const arr = [1];
arr.push(2);
arr.pop();
arr[0] = 4;`,
    codeLanguage: 'javascript',
  },
  {
    id: 'js-3',
    question: 'What is meant by hoisting in JavaScript? Are functions hoisted? Are classes hoisted?',
  },
  {
    id: 'js-4',
    question: 'What are closures in JavaScript?',
  },
  {
    id: 'js-4.1',
    question: 'What is the output of the following code? Explain why.',
    code: `function display() {
  let arr = [];
  for (let a = 0; a < 4; a++) {
    arr.push(function d() {
      console.log(a);
    });
  }
  return arr;
}
let resp = display();
resp.forEach(d => d());`,
    codeLanguage: 'javascript',
    parentId: 'js-4',
  },
  {
    id: 'js-5',
    question: 'What is the use of .bind(), .call(), and .apply()? Write the polyfill for each of them.',
  },
  {
    id: 'js-6',
    question: 'How is inheritance implemented in JS?',
  },
  {
    id: 'js-7',
    question: 'What is the difference between __proto__ and prototype?',
  },
  {
    id: 'js-8',
    question: 'Explain how the this keyword works.',
  },
  {
    id: 'js-9',
    question: 'Write a function to reverse the characters of any given string using function chaining.',
    code: `// Expected behaviour:
"str".reverse() === "rts"
"str".reverse().reverse() === "str"`,
    codeLanguage: 'javascript',
  },
  {
    id: 'js-10',
    question: 'What are Immediately Invoked Function Expressions (IIFE) and how are they used?',
  },
  {
    id: 'js-11',
    question: 'How does the Nullish Coalescing operator (??) work?',
  },
  {
    id: 'js-12',
    question: 'How is the rest operator different from the spread operator? (Both use ...)',
  },
  {
    id: 'js-13',
    question: 'How does setTimeout / setInterval work?',
  },
  {
    id: 'js-14',
    question: 'What are event propagation and event delegation? Given the DOM structure below, how would you prevent the onclick of #parent from firing when #child is clicked?',
    code: `<div id="parent" onclick="console.log('outer')">
  <div>Filler Piece</div>
  <div id="child" onclick="console.log('inner')">Click me</div>
</div>`,
    codeLanguage: 'html',
  },
  {
    id: 'js-15',
    question: 'How does the event loop work?',
  },
  {
    id: 'js-16',
    question: 'What is the order of console output in the following snippets? (See sub-questions 16.1 and 16.2)',
  },
  {
    id: 'js-16.1',
    question: 'What is the order of console output?',
    code: `console.log("Start");
setTimeout(() => console.log('Set timeout'));
Promise.resolve(console.log('Promise'));
Promise.resolve(() => {
  console.log('Promise2');
  setTimeout(() => console.log('Set timeout2'));
});
console.log("End");`,
    codeLanguage: 'javascript',
    parentId: 'js-16',
  },
  {
    id: 'js-16.2',
    question: 'What is the order of console output? (Note the IIFE inside Promise.resolve)',
    code: `console.log("Start");
setTimeout(() => console.log('Set timeout'));
Promise.resolve(console.log('Promise'));
Promise.resolve((() => {
  console.log('Promise2');
  setTimeout(() => console.log('Set timeout2'));
})());
console.log("End");`,
    codeLanguage: 'javascript',
    parentId: 'js-16',
  },
  {
    id: 'js-17',
    question: 'What are the micro-queue and macro-queue in JS?',
  },
  {
    id: 'js-18',
    question: 'What are Promises? What is the advantage of writing them with async/await?',
  },
  {
    id: 'js-19',
    question: 'What is callback hell? How does a Promise help to mitigate it?',
  },
  {
    id: 'js-20',
    question: 'How does the .then() method work?',
  },
  {
    id: 'js-21',
    question: 'How are classes different from functions in JS?',
  },
  {
    id: 'js-22',
    question: 'How do you make objects immutable?',
  },
  {
    id: 'js-23',
    question: 'What is the difference between an Object and a Map in JS?',
  },
  {
    id: 'js-24',
    question: 'What is the difference between an Array and a Set in JS?',
  },
  {
    id: 'js-24.1',
    question: 'How do you ensure uniqueness in a Set of objects?',
    parentId: 'js-24',
  },
  {
    id: 'js-25',
    question: 'What are Symbols in JS? How are they used?',
  },
  {
    id: 'js-26',
    question: 'How do you iterate over the keys of an object?',
  },
  {
    id: 'js-27',
    question: 'How many methods are there to create an object?',
  },
  {
    id: 'js-28',
    question: 'What are constructor functions?',
  },
  {
    id: 'js-29',
    question: 'How do you invoke a parent function/class method from inside a child function/class?',
  },
  {
    id: 'js-30',
    question: 'How do you perform function overriding in JS?',
  },
  {
    id: 'js-31',
    question: 'What are decorators in JS?',
  },
  {
    id: 'js-32',
    question: 'What are generators in JS? How does the yield keyword work?',
  },
];

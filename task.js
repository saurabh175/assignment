const readline = require('readline');

function NetDiscount(cart, options) {
  let maxDiscount = 0;
  let maxProfitRule = "";

  for (const rule in options) {
    const discountAmount = options[rule](cart);

    if (discountAmount > maxDiscount) {
      maxDiscount = discountAmount;
      maxProfitRule = rule;
    }
  }

  return { maxProfitRule, maxDiscount };
}

const options = {
  op1: (cart) => (cart.totalAmount > 200 ? 10 : 0),
  op2: (cart) => {
    for (const product in cart.products) {
      if (cart.products[product].quantity > 10) {
        return cart.products[product].total * 0.05;
      }
    }
    return 0;
  },
  op3: (cart) => (cart.totalQuantity > 20 ? cart.totalAmount * 0.1 : 0),
  op4: (cart) => {
    if (cart.totalQuantity > 30) {
      for (const product in cart.products) {
        if (cart.products[product].quantity > 15) {
          return (
            (cart.products[product].quantity - 15) *
            cart.products[product].price *
            0.5
          );
        }
      }
    }
    return 0;
  },
};

function calculateFees(cart) {
  const wrapFee = cart.totalQuantity * 1;
  const deliveryFee = Math.ceil(cart.totalQuantity / 10) * 5;
  return { wrapFee, deliveryFee };
}

async function main() {
  const cart = {
    products: {
      ProductA: { price: 20, quantity: 0, total: 0 },
      ProductB: { price: 40, quantity: 0, total: 0 },
      ProductC: { price: 50, quantity: 0, total: 0 },
    },
    totalQuantity: 0,
    totalAmount: 0,
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => resolve(answer));
    });
  }

  for (const product in cart.products) {
   
    cart.products[product].quantity = parseInt(await ask(`Enter quantity for ${product}: `), 10);
    const isGiftWrapped = (await ask(`Is ${product} wrapped as a gift? (yes/no) `)).toLowerCase();
    if (isGiftWrapped === "yes") {
      cart.totalAmount += cart.products[product].quantity * 1; // Gift wrap fee
    }
    cart.products[product].total = cart.products[product].quantity * cart.products[product].price;
    cart.totalAmount += cart.products[product].total;
    cart.totalQuantity += cart.products[product].quantity;
  }

  const { maxProfitRule, maxDiscount } = NetDiscount(cart, options);
  cart.totalAmount -= maxDiscount;

  const { wrapFee, deliveryFee } = calculateFees(cart);
  cart.totalAmount += wrapFee + deliveryFee;

  console.log("Product Details:");
  for (const product in cart.products) {
    console.log(
      `${product}: Quantity - ${cart.products[product].quantity}, Total - $${cart.products[product].total}`
    );
  }
  console.log(`Subtotal: $${cart.totalAmount + maxDiscount}`);
  console.log(`Discount Applied: ${maxProfitRule} - $${maxDiscount}`);
  console.log(`Gift Wrap Fee: $${wrapFee}`);
  console.log(`Total: $${cart.totalAmount}`);
  console.log(`Shipping Fee: $${deliveryFee}`);

  rl.close();
}

main();

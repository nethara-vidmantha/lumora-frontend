export function loadCart(){
    let cartString = localStorage.getItem("cart") // item1,item2,item3 load. It is a String

    if(cartString==null){
        localStorage.setItem("cart","[]")
        cartString = "[]"
    }

    const cart=JSON.parse(cartString) // convert string items to array of items

    return cart

}

export function addToCart(product, quantity){
    let cart=loadCart()

    const existingProductIndex = cart.findIndex(
        (item) =>{
            return item.productId == product.productId
        }
    )

    if(existingProductIndex == -1){
        //item is not in a cart

        if(quantity<1){
            console.log("Quantity must be at least 1")
            return
        }

        const cartItem={
             productId: product.productId,
                name: product.name,
                price: product.price,
                labelPrice: product.labelPrice,
                quantity: quantity,
                image: product.images[0]
        }

        cart.push(cartItem)
    }

    else{
        const existingItem = cart[existingProductIndex]

        const newQuantity = existingItem.quantity + quantity

        if(newQuantity<1){
            cart = cart.filter(
                (item)=>{
                    return item.productId != product.productId
                }
            )
        }

        else{
            existingItem.quantity = newQuantity
        }
    }

    localStorage.setItem("cart" , JSON.stringify(cart))
}

export function GetTotal()
{
    const cart = loadCart()
    let total=0

    cart.forEach(
        (item)=>{
            total += item.price * item.quantity
        }
    )
    return total
}

export function clearCart() {
    localStorage.setItem("cart", "[]");
}

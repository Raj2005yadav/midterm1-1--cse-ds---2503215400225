
const http = require("http");
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "products.json");


function readProducts() {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveProducts(products) {
    fs.writeFileSync(file, JSON.stringify(products, null, 2));
}


const server = http.createServer((req, res) => {

    res.setHeader("Content-Type", "application/json");

    
    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", () => {
        const url = new URL(req.url, "http://localhost:3000");
        const id = Number(url.pathname.split("/")[2]);

        
        if (req.method === "GET" && url.pathname === "/products") {
            res.end(JSON.stringify(readProducts()));
        }

        
        else if (req.method === "GET" && url.pathname.startsWith("/products/")) {
            const products = readProducts();
            const product = products.find(p => p.id === id);

            if (product) {
                res.end(JSON.stringify(product));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ message: "Product not found" }));
            }
        }

        
        else if (req.method === "POST" && url.pathname === "/products") {
            try {
                const data = JSON.parse(body);
                const products = readProducts();

                if (
                    typeof data.name !== "string" || !data.name.trim() ||
                    typeof data.price !== "number" ||
                    !Number.isFinite(data.price) || data.price < 0 ||
                    typeof data.category !== "string" || !data.category.trim()
                ) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ message: "Invalid product details" }));
                }

                let newId = 1;

                if (products.length > 0) {
                    newId = Math.max(...products.map(p => p.id)) + 1;
                }

                const product = {
                    id: newId,
                    name: data.name.trim(),
                    price: data.price,
                    category: data.category.trim()
                };

                products.push(product);
                saveProducts(products);

                res.statusCode = 201;
                res.end(JSON.stringify(product));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: "Invalid JSON data" }));
            }
        }

        
        else if (req.method === "PUT" && url.pathname.startsWith("/products/")) {
            try {
                const data = JSON.parse(body);
                const products = readProducts();
                const product = products.find(p => p.id === id);

                if (!product) {
                    res.statusCode = 404;
                    return res.end(JSON.stringify({ message: "Product not found" }));
                }

                if (
                    typeof data.name !== "string" || !data.name.trim() ||
                    typeof data.price !== "number" ||
                    !Number.isFinite(data.price) || data.price < 0 ||
                    typeof data.category !== "string" || !data.category.trim()
                ) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ message: "Invalid product details" }));
                }

                product.name = data.name.trim();
                product.price = data.price;
                product.category = data.category.trim();

                saveProducts(products);

                res.end(JSON.stringify({
                    message: "Product updated successfully",
                    product: product
                }));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: "Invalid JSON data" }));
            }
        }

        
        else if (req.method === "DELETE" && url.pathname.startsWith("/products/")) {
            const products = readProducts();
            const index = products.findIndex(p => p.id === id);

            if (index === -1) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ message: "Product not found" }));
            }

            const deletedProduct = products.splice(index, 1)[0];
            saveProducts(products);

            res.end(JSON.stringify({
                message: "Product deleted successfully",
                product: deletedProduct
            }));
        }

     
        else {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Route not found" }));
        }
    });
});


server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});

name midterm-1-<cse-ds>-<2503215400225>

const { Router } = require("express");
const mercadopago = require("mercadopago");
const dotenv = require("dotenv");
dotenv.config();
const Mercado_Pago = Router();

mercadopago.configure({
  access_token: process.env.ACCESS_TOKE || "",
  client_id: process.env.MP_CLIENT_ID || "",
  client_secret: process.env.MP_CLIENT_SECRET || ""
});

Mercado_Pago.post("/", async (req, res) => {
  const carrito = req.body;

  try {
    const items = carrito.map(producto => ({
      title: producto.titulo,
      unit_price: producto.precio,
      currency_id: "ARS",
      quantity: producto.cantidad,
    }));

    const preference = {
      items: items,

      back_urls: {
        success: "http://www.backendpruebamercadopago.vercel.app/checkout",
        failure: "http://backendpruebamercadopago.vercel.app/fail",
      },

      auto_return: "approved",
    };

    const respuesta = await mercadopago.preferences.create(preference);
    console.log(respuesta);
    res.status(200).json(respuesta.response.init_point);
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error.message);
  }
});

module.exports = Mercado_Pago;
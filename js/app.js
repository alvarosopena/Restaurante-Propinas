let cliente = {
    mesa:"",
    hora:"",
    pedido:[]    
}

const categorias = {
    1 : "Comida",
    2 : "Bebidas",
    3 : "Postre"
}

const btnGuardarCliente = document.querySelector("#guardar-cliente");
btnGuardarCliente.addEventListener("click", guardarCliente);

function guardarCliente(){
    const mesa = document.querySelector("#mesa").value;
    const hora = document.querySelector("#hora").value;

    //Revisar si hay campos vacios
    const camposVacios = [mesa,hora].some(campo => campo === "");//con .some verifica que al menos uno cumpla una condición

    if (camposVacios){
        //Verificar si ya hay una alerta
        const existeAlerta = document.querySelector(".invalid-feedback");

        if(!existeAlerta){
            const alerta = document.createElement("div");
            alerta.classList.add("invalid-feedback","d-block","text-center");
            alerta.textContent = "Todos los campos son obligatorios";
            //Creamos la alerta, seleccionamos donde la vamos a poner y con appendchild la insertamos
            document.querySelector(".modal-body form").appendChild(alerta);

            setTimeout(()=>{
                alerta.remove()
            }, 3000 );
        }

        return;

    } 
     
    //Asignar datos de formulario a cliente - usamos ...cliente primero para no perder el array de pedido que queda vacio todavía
    cliente = { ...cliente, mesa, hora }

    //Ocultar modal
    const modalFormulario = document.querySelector("#formulario");
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    //Mostrar las secciones
    mostrarSecciones();

    //Obtener platillos de la API de JSON-Server
    obtenerPlatillos();
}

function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll(".d-none");
    seccionesOcultas.forEach(seccion => seccion.classList.remove("d-none"));
}

function obtenerPlatillos(){
    const URL = "http://localhost:3000/platillos";

    fetch(URL)
        .then( respuesta => respuesta.json() )
        .then( resultado => mostrarPlatillos(resultado))
        .catch( error => console.log(error) )
}

function mostrarPlatillos(platillos){
    const contenido = document.querySelector("#platillos .contenido");

    platillos.forEach(platillo => {
        const row = document.createElement("div");
        row.classList.add("row","py-3","border-top");

        const nombre = document.createElement("div");
        nombre.classList.add("col-md-4");
        nombre.textContent = platillo.nombre;

        const precio = document.createElement("div");
        precio.classList.add("col-md-3", "fw-bold");
        precio.textContent = `$ ${platillo.precio}`;

        const categoria = document.createElement("div");
        categoria.classList.add("col-md-3");
        //usamos la variable categorias y usamos el numero de platillo para que nos de la categoria
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement("input");
        inputCantidad.type = "number";
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add("form-control");

        //Función que detecta la cantidad y el platillo que se esta agregando - no se puede crear un eventlistener a un elemento que fue creado despues, usamos .onchange
        inputCantidad.onchange = function(){
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...platillo, cantidad}); //{} lo convierto a obj, uso el spread para que crear un objeto junto a la cantidad
        }

        const agregar = document.createElement("div");
        agregar.classList.add("col-md-2");
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);

    })
}

function agregarPlatillo(producto){
    
    //Extrar el pedido actual
    let { pedido } = cliente;
    
    //Revisar que la cantidad sea mayor a 0
    if( producto.cantidad > 0 ){

        //Comprueba si el elemento ya existe en el array
        if( pedido.some ( articulo => articulo.id === producto.id ) ){
            // El articulo ya existe, actualizar la cantidad
            const pedidoActualizado = pedido.map( articulo =>{
                if ( articulo.id === producto.id ){
                    articulo.cantidad = producto.cantidad;

                }
                return articulo;
            });
            // Se asigna el nuevo array a cliente.pedido
            cliente.pedido = [...pedidoActualizado];
        } else {
            // El articulo no eixste lo agregamos al array de pedido
            cliente.pedido = [...pedido, producto];
        }
                
    } else {
        //Eliminar elementos cuando la cantidad es 0
        const resultado = pedido.filter( articulo => articulo.id !== producto.id ); //Nos retorna los que son diferentes al que estoy poniendo 0
        cliente.pedido = [...resultado];
    }
    
    //Limpiar el codigo HTML previo
    limpiarHTML();

    if( cliente.pedido.length ) {
        //Mostrar Resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }
}

function actualizarResumen(){
    const contenido = document.querySelector("#resumen .contenido");

    const resumen = document.createElement("div");
    resumen.classList.add("col-md-6", "card", "py-2", "px-3", "shadow");

    //Información de la mesa
    const mesa = document.createElement("p");
    mesa.textContent = "Mesa: "
    mesa.classList.add("fw-bold");

    const mesaSpan = document.createElement("span");
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add("fw-normal");

    //Información de la hora
    const hora = document.createElement("p");
    hora.textContent = "Hora: "
    hora.classList.add("fw-bold");

    const horaSpan = document.createElement("span");
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add("fw-normal");

    //Titulo de la sección
    const heading = document.createElement("h3");
    heading.textContent = "Platillos Consumidos";
    heading.classList.add = ("my-4", "text-center");

    //Iterar sobre el array de pedidos
    const grupo = document.createElement("ul");
    grupo.classList.add("list-group");

    const { pedido } = cliente;
   
    pedido.forEach ( articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement("li");
        lista.classList.add("list-group-item");

        const nombreEl = document.createElement("h4");
        nombreEl.classList.add("my-4");
        nombreEl.textContent = nombre;

        //Cantidad del articulo
        const cantidadEl = document.createElement("p");
        cantidadEl.classList.add("my-4");
        cantidadEl.textContent = "Cantidad: "

        const cantidadValor = document.createElement("span");
        cantidadValor.classList.add("fw-normal");
        cantidadValor.textContent = cantidad;

        //Precio del articulo
        const precioEl = document.createElement("p");
        precioEl.classList.add("my-4");
        precioEl.textContent = "Precio: "

        const precioValor = document.createElement("span");
        precioValor.classList.add("fw-normal");
        precioValor.textContent = `$ ${precio}`;
        
        //Subtotal del articulo
        const subtotalEl = document.createElement("p");
        subtotalEl.classList.add("my-4");
        subtotalEl.textContent = "Subtotal: "

        const subtotalValor = document.createElement("span");
        subtotalValor.classList.add("fw-normal");
        subtotalValor.textContent = `$ ${precio*cantidad}`;

        //Boton para eliminar
        const btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn", "btn-danger");
        btnEliminar.textContent = "Eliminar pedido";

        //Funcion para eliminar el pedido
        btnEliminar.onclick = function () {
            eliminarProducto(id);
        }

        //Agregar Valores a sus contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);
        
        //Agregar elementos al LI
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        //Agregar lista al grupo principal
        grupo.appendChild(lista)

    });

    // Agregar a los elementos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    // Agregar al contenido
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    //Mostrar formulario de propinas
    formularioPropinas();

}

function limpiarHTML(){
    const contenido = document.querySelector("#resumen .contenido");
    //Mientras haya elementos en ese div de #resumen .contenido los va a remover
    while ( contenido.firstChild ){
        contenido.removeChild(contenido.firstChild);
    }
}

function eliminarProducto(id){
    const { pedido } = cliente;
    const resultado = pedido.filter ( articulo => articulo.id !== id);
    cliente.pedido = [...resultado];

    //Limpiar HTML previo
    limpiarHTML();
    
    if( cliente.pedido.length ) {
        //Mostrar Resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    //El producto se elimino, regresamos la cantidad a 0 en el form
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;

}

function mensajePedidoVacio(){
    const contenido = document.querySelector("#resumen .contenido");
    const texto = document.createElement("p");
    texto.classList.add("text-center");
    texto.textContent = "Añade los elementos del pedido";

    contenido.appendChild(texto);
}

function formularioPropinas(){
    const contenido = document.querySelector("#resumen .contenido");

    const formulario = document.createElement("div");
    formulario.classList.add("col-md-6", "formulario");

    const divFormulario = document.createElement("div");
    divFormulario.classList.add("card", "py-2", "shadow", "px-3");

    const heading = document.createElement("h3");
    heading.classList.add("my-4", "text-center");
    heading.textContent = "Propinas";

    //Radio button 10%
    const radio10 = document.createElement("input");
    radio10.type = "radio";
    radio10.name = "propina";
    radio10.value = "10";
    radio10.classList.add("form-check-input");
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement("label");
    radio10Label.textContent = "%10"
    radio10Label.classList.add("form-check-label");

    const radio10Div = document.createElement("div");
    radio10Div.classList.add("form-check");

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    //Radio button 25%
    const radio25 = document.createElement("input");
    radio25.type = "radio";
    radio25.name = "propina";
    radio25.value = "25";
    radio25.classList.add("form-check-input");
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement("label");
    radio25Label.textContent = "%25"
    radio25Label.classList.add("form-check-label");

    const radio25Div = document.createElement("div");
    radio25Div.classList.add("form-check");

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    //Radio button 50%
    const radio50 = document.createElement("input");
    radio50.type = "radio";
    radio50.name = "propina";
    radio50.value = "50";
    radio50.classList.add("form-check-input");
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement("label");
    radio50Label.textContent = "%50"
    radio50Label.classList.add("form-check-label");

    const radio50Div = document.createElement("div");
    radio50Div.classList.add("form-check");

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    //Agregar al div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    //Agregar al formulario
    formulario.appendChild(divFormulario);

    contenido.appendChild(formulario);

}

function calcularPropina(){
    const { pedido } = cliente;
    let subtotal = 0;

    //Calcular el subtotal a pagar
    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });
    
    //Seleccionar radio button con la propina
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;
    console.log(propinaSeleccionada)

    //Calcular propina
    const propina = ((subtotal * parseInt(propinaSeleccionada)) /100 );

    //Calcular el total a pagar
    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina);

}

function mostrarTotalHTML(subtotal, total, propina) {
    
    const divTotales = document.createElement("div");
    divTotales.classList.add("total-pagar");

    //Subtotal
    const subtotalParrafo = document.createElement("p");
    subtotalParrafo.classList.add("fs-3", "fw-bold", "mt-2");
    subtotalParrafo.textContent = "Subtotal Consumo: ";

    const subtotalSpan = document.createElement("span");
    subtotalSpan.classList.add("fw-normal");
    subtotalSpan.textContent = `$ ${subtotal}`;

    subtotalParrafo.appendChild(subtotalSpan);

    //Propina
    const propinaParrafo = document.createElement("p");
    propinaParrafo.classList.add("fs-3", "fw-bold", "mt-2");
    propinaParrafo.textContent = "Propina: ";

    const propinaSpan = document.createElement("span");
    propinaSpan.classList.add("fw-normal");
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.appendChild(propinaSpan);

    //Total
    const totalParrafo = document.createElement("p");
    totalParrafo.classList.add("fs-3", "fw-bold", "mt-5");
    totalParrafo.textContent = "Total consumo: ";

    const totalSpan = document.createElement("span");
    totalSpan.classList.add("fw-bold");
    totalSpan.textContent = `$ ${total}`;

    totalParrafo.appendChild(totalSpan);

    //Eliminar el último resultado que se repite
    const totalpagarDiv = document.querySelector(".total-pagar")
    if(totalpagarDiv){
        totalpagarDiv.remove();
    }


    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector(".formulario > div");
    formulario.appendChild(divTotales);


}

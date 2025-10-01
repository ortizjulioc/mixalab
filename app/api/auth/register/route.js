const {NextResponse} = require("next/server");

export async function POST(request) {
    const data = await request.json();
    console.log("Data received in register route:", data);
    // Aquí iría la lógica para registrar al usuario en la base de datos
    return NextResponse.json({message: "User registered successfully"});
}
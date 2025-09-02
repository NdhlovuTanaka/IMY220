export async function signin(payload){
    const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(payload)
    });
    return res.json();
}

export async function signup(payload){
    const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(payload)
    });
    return res.json();        
}
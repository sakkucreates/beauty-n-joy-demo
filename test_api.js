async function run() {
  try {
    console.log("Testing API route...");
    const url = "https://www.google.com/maps/place/Empire+State+Building/@40.7484405,-73.9856644,17z/data=!3m1!4b1!4m6!3m5!1s0x89c259a9b3117469:0xd134e199a405a163!8m2!3d40.7484405!4d-73.9856644!16zL20vMDJfeTBR?entry=ttu";
    const res = await fetch("http://localhost:3000/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();

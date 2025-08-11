export default function Register() {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form className="flex flex-col gap-4">
        <input className="border p-2 rounded" type="text" placeholder="Name" />
        <input className="border p-2 rounded" type="email" placeholder="Email" />
        <input className="border p-2 rounded" type="password" placeholder="Password" />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700" type="submit">Register</button>
      </form>
    </div>
  );
}

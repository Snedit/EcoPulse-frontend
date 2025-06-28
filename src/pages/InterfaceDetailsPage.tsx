/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { interfaceService } from "../services/interfaceService";
import { deviceService } from "../services/deviceService";
import { userService } from "../services/userService";
import { Copy, Trash2, Plus, Cpu, User } from "lucide-react";

export default function InterfaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [accessList, setAccessList] = useState<
    { username: string; role: string }[]
  >([]);

  const [devices, setDevices] = useState<any[]>([]);
  const [newAccessUser, setNewAccessUser] = useState("");
  const [copied, setCopied] = useState(false);
  const [accessType, setAccessType] = useState<"ADMIN" | "VIEWER">("VIEWER");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await interfaceService.getInterfaceById(id || "");
        // const renderData = data;
        console.log("point B");
        console.table(data);
        setDetails(data);

        const allDevices = await deviceService.getAllDevices();
        const underThisInterface = allDevices.filter(
          (dev: any) => dev.interfaceId === id
        );
        console.log("point c");
        console.log(underThisInterface);

        setDevices(underThisInterface);
        console.log("interface details");
        console.log(data);

        // ✅ New line to fetch access list
        if (data.role === "ADMIN") {
          const accessRes = await interfaceService.getAccessList(id || "");
          setAccessList(accessRes.data);
          console.log(accessRes);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch interface details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(id || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleAddAccess = async () => {
    try {
      await interfaceService.addAccess(id || "", newAccessUser, accessType);
      alert("✅ Access granted");
      setNewAccessUser("");
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add access");
    }
  };

  const handleDeleteAccess = async (usernameToRemove: string) => {
    const password = prompt(
      `To remove access for ${usernameToRemove}, enter your password:`
    );

    if (!password) {
      alert("❌ Password is required to proceed.");
      return;
    }

    try {
      await interfaceService.removeAccess({
        interface_id: id || "",
        password: password,
      });

      alert(`✅ Access removed for ${usernameToRemove}`);

      const updatedAccessList = await interfaceService.getAccessList(id || "");
      setAccessList(updatedAccessList.data);
    } catch (error: any) {
      console.error(error);
      alert("❌ Failed to remove access: " + error.message);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this interface?"
    );
    if (!confirm) return;

    try {
      await interfaceService.deleteInterface(id || "");
      alert("✅ Interface deleted");
      navigate("/interface");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete interface");
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewAccessUser(value);
    if (value.length >= 2) {
      try {
        const response = await userService.getSuggestions(value);
        const usernames = response.data.map((user: any) => user.username); // 👈 extract usernames
        setSuggestions(usernames);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (username: string) => {
    setNewAccessUser(username);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary-500" /> {details.name}
              </h1>
              {details.role == "ADMIN" && (
                <button
                  onClick={handleDelete}
                  className="text-red-500 flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>

            <div className="mb-4 text-gray-300">
              <p>
                <strong>Description:</strong>{" "}
                {details.description || "No description provided."}
              </p>
              <p className="flex items-center gap-2">
                <strong>ID:</strong> {details.id}
                <button onClick={handleCopy}>
                  <Copy className="w-4 h-4 text-blue-500" />
                </button>
                {copied && (
                  <span className="text-green-500 text-sm">Copied!</span>
                )}
              </p>
              <p>
                <strong>Owner:</strong> {details.ownerUsername}
              </p>
              <p>
                <strong>Role:</strong> {details.role}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(details.createdAt).toLocaleString()}
              </p>
            </div>
            {details.role === "ADMIN" && (
              <>
                <hr className="my-6 border-slate-600" />

                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">
                    Devices Under This Interface
                  </h2>
                  {devices.length === 0 ? (
                    <p className="text-gray-400">No devices assigned.</p>
                  ) : (
                    <ul className="space-y-2">
                      {devices.map((dev) => (
                        <li
                          key={dev.id}
                          className="bg-slate-800 p-3 rounded-md border border-slate-600 text-white"
                        >
                          <p className="font-medium">{dev.name}</p>
                          <p className="text-sm">
                            Type: {dev.type} | Location: {dev.location}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <hr className="my-6 border-slate-600" />

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Current Access List
                  </h2>

                  {accessList.length === 0 ? (
                    <p className="text-gray-400">No users have access yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {accessList.map((entry, idx) => (
                        <li
                          key={idx}
                          className="bg-slate-800 p-3 rounded-md border border-slate-600 text-white flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">
                              {entry.username}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-sm rounded-md font-semibold ${
                                entry.role === "ADMIN"
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                            >
                              {entry.role}
                            </span>

                            {entry.username !== details.ownerUsername && (
                              <button
                                onClick={() =>
                                  handleDeleteAccess(entry.username)
                                }
                                className="text-red-500 hover:text-red-700 ml-3"
                                title="Revoke Access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <hr className="my-6 border-slate-600" />

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Add User Access
                  </h2>
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={newAccessUser}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                      className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute z-10 bg-slate-700 w-full border border-slate-500 rounded-md mt-1 max-h-40 overflow-y-auto">
                        {suggestions.map((user, idx) => (
                          <li
                            key={idx}
                            onClick={() => handleSuggestionClick(user)}
                            className="px-3 py-2 cursor-pointer hover:bg-slate-600 text-white"
                          >
                            <User className="inline w-4 h-4 mr-2" /> {user}
                          </li>
                        ))}
                      </ul>
                    )}
                    {newAccessUser && (
                      <div className="mt-2">
                        <label
                          htmlFor="accessType"
                          className="block text-sm text-white mb-1"
                        >
                          Select Access Type
                        </label>
                        <select
                          id="accessType"
                          value={accessType}
                          onChange={(e) =>
                            setAccessType(e.target.value as "ADMIN" | "VIEWER")
                          }
                          className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="VIEWER">VIEWER</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddAccess}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </>
            )}

            {details.role !== "ADMIN" && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded-md mb-6 shadow-md flex items-start gap-3">
                <svg
                  className="w-6 h-6 mt-1 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
                <div>
                  <p className="font-semibold">Limited Access</p>
                  <p className="text-sm">
                    You are currently logged in as a <strong>VIEWER</strong>.
                    You do not have permission to manage user access for this
                    interface.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

const accounts = {
  onboarded: {
    email: "e2e.onboarded@example.com",
    password: "Password123!",
    mode: "persistent"
  },
  transient: {
    email: "e2e.transient@example.com",
    password: "Password123!",
    mode: "delete"
  }
};

const accountName = globalThis.E2E_ACCOUNT || "onboarded";
const account = accounts[accountName];

if (!account) {
  throw new Error(`Unknown E2E_ACCOUNT "${accountName}"`);
}

const isMissing = (v) => v == null || v === "" || v === "undefined" || v === "null";

if (isMissing(globalThis.SUPABASE_URL) || isMissing(globalThis.SUPABASE_SERVICE_ROLE_KEY)) {
  output.account = accountName;
  output.email = account.email;
  output.password = account.password;
  output.seedSkipped = true;
  if (account.mode === "delete") {
    throw new Error(
      "Transient account requires Supabase env vars."
    );
  }
} else {

const baseUrl = SUPABASE_URL.replace(/\/$/, "") + "/auth/v1/admin/users";
const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
};

function check(response, message) {
  if (!response.ok) throw new Error(`${message}: ${response.status} ${response.body}`);
  return response.body ? json(response.body) : {};
}

function findUserByEmail(email) {
  const body = check(
    http.get(`${baseUrl}?filter=${encodeURIComponent(email)}`, { headers }),
    "Could not search users"
  );
  return (body.users || []).find((u) => u.email === email) || null;
}

function deleteUserByEmail(email) {
  const user = findUserByEmail(email);
  if (!user) {
    return;
  }
  check(http.delete(`${baseUrl}/${user.id}`, { headers }), `Could not delete user ${user.id}`);
}


if (account.mode === "delete") {
  deleteUserByEmail(account.email);
} 

output.account = accountName;
output.email = account.email;
output.password = account.password;

}

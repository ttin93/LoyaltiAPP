import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { validBirthday } from "@/lib/guest";
import { errMsg } from "@/lib/loyalty";

// POST /api/profile { name?, birthday? ("MM-DD") }
// Rojstni dan se v članstva zapiše samo enkrat (kasneje ga ni mogoče spremeniti).
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });
    const email = user.email.toLowerCase();
    const body = await req.json();
    const db = getServiceClient();
    const md = { ...(user.user_metadata ?? {}) } as Record<string, unknown>;

    if (typeof body.name === "string") md.name = body.name.trim().slice(0, 60);

    if (body.birthday !== undefined) {
      if (!validBirthday(body.birthday)) return NextResponse.json({ ok: false, error: "Izberi dan in mesec." }, { status: 400 });
      const { data: known } = await db.from("customers").select("birthday").eq("email", email).not("birthday", "is", null).limit(1);
      if (known?.length || validBirthday(md.birthday)) {
        return NextResponse.json({ ok: false, error: "Rojstni dan je že shranjen in ga ni mogoče spremeniti." }, { status: 409 });
      }
      md.birthday = body.birthday;
      await db.from("customers").update({ birthday: body.birthday }).eq("email", email).is("birthday", null);
    }

    const { error } = await db.auth.admin.updateUserById(user.id, { user_metadata: md });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}

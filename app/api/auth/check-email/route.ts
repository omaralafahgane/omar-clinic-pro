import { NextRequest, NextResponse } from '''next/server''';
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: '''Email is required''' }, { status: 400 });
    }

    // 1. Check if user exists in the users table by email
    const { data, error } = await supabase
      .from('''users''')
      .select('''id, approval_status''')
      .eq('''email''', email)
      .maybeSingle();

    if (error) {
      console.error('''Supabase check error:''', error);
      return NextResponse.json({ error: '''Database error''' }, { status: 500 });
    }

    if (data) {
      return NextResponse.json({ 
        exists: true,
        message: '''User found''',
        approval_status: data.approval_status
      });
    }

    // 2. If not in Supabase, check if the current session is this user
    // This handles the case where Webhook failed but user is logged in Clerk
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (userId && clerkUser && clerkUser.emailAddresses.some(e => e.emailAddress === email)) {
      console.log('''User exists in Clerk but not Supabase, creating...''' );
      
      let roleName = "owner";
      let approvalStatus = "pending";
      
      if (email === "omaralblack@gmail.com") {
        roleName = "admin";
        approvalStatus = "approved";
      }

      const { data: newUser, error: createError } = await supabase
        .from('''users''')
        .insert([{
          id: userId,
          email: email,
          first_name: clerkUser.firstName || '''User''',
          last_name: clerkUser.lastName || '''''',
          role: roleName,
          role_id: roleName === '''admin''' ? '''4a1dd532-188f-46ae-981a-e517c6134fc5''' : '''clinic_owner_id_placeholder''',
          is_active: true,
          approval_status: approvalStatus
        }])
        .select()
        .single();

      if (!createError) {
        return NextResponse.json({ 
          exists: true,
          message: '''User created from Clerk session''',
          approval_status: approvalStatus
        });
      }
    }

    return NextResponse.json({ 
      exists: false,
      message: '''User not found'''
    });
  } catch (error) {
    console.error('''Auth check error:''', error);
    return NextResponse.json({ error: '''Internal server error''' }, { status: 500 });
  }
}

import type { 
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getContact,updateContact } from "../data";

// Loader関数！！！！！$contactIdに書いたLoader関数と同じでは？！
// まあ一個とってくるってのは同じだしそりゃそうか？
export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};

// Action関数！！！！！
export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  // requestっていう引数何？！って感じだけど、これらはremix関係なく、webに元からある機能
  // ちな「formData」も規定値
  const formData = await request.formData();
  // 「Object.fromEntries」で、フォームの入力内容をオブジェクトにまとめられる！
  const updates = Object.fromEntries(formData);
  // updateContact関数は、idと入力データをまとめたオブジェクトを使って、データを更新する関数
  await updateContact(params.contactId, updates);
  return redirect(`/contacts/${params.contactId}`);
  // RemixではAction関数の実行後の再レンダリングは自動なので特に記述はいらない
};

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          aria-label="First name"
          defaultValue={contact.first}
          name="first"
          placeholder="First"
          type="text"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea
          defaultValue={contact.notes}
          name="notes"
          rows={6}
        />
      </label>
      <p>
        {/* submitを持ったボタンSaveが押されたら上のAction関数が呼ばれる */}
        <button type="submit">Save</button>
        <button type="button">Cancel</button>
      </p>
    </Form>
  );
}

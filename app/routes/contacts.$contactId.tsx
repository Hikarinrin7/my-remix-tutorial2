import { Form, useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { FunctionComponent } from "react";
// Loader関数の引数の型の安全性検証
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

// import typeでインポートしてるのがdata.tsの前半にあるデータベースそのものの関数って感じで
// importでインポートしてるのはdata.tsの後半にある高度なヘルパー関数
import type { ContactRecord } from "../data";
import { getContact, updateContact } from "../data";

// Loader関数！！！！！
export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  // paramsはURLの一部でnullの可能性もあるし、ちゃんと取れてるか検証するinvariant
  invariant(params.contactId, "Missing contactId param");
  // 関数getContactの引数はidで、idに応じたデータを一つ返す
  const contact = await getContact(params.contactId);
  // ちゃんとgetContactから返ってきてる？もチェック
  if (!contact) {
    throw new Response("Not Found", { status:404 });
  }
  return json({ contact });
};


// Action関数！！！！！お気に入りの管理。fetcher.Formで呼び出す
// Formとの違いは、URLが変わらないところ
export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  return updateContact(params.contactId, {
    // 「送信された状態がtrueかどうか」をfavoriteに設定する、という荒技
    favorite: formData.get("favorite") === "true",
  });
};
// Action関数だから実行後に自動レンダリングされるのは一緒（サイドバーも自動更新）



export default function Contact() {
  // Loader関数で読み込んだデータの使用！！！！！
  const { contact } = useLoaderData<typeof loader>();

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a
              href={`https://twitter.com/${contact.twitter}`}
            >
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
  const fetcher = useFetcher();
  // const favorite = contact.favorite;
  // 楽観的UI＝
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  return (
    <fetcher.Form method="post">
      <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
};



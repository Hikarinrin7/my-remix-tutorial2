import { json, redirect } from "@remix-run/node";
// CSSの読み込み
import type { LinksFunction, LoaderFunctionArgs, } from "@remix-run/node";
// 検索窓から消えちゃう問題解消
import { useEffect } from "react";

import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

// Loader関数とAction関数
import { getContacts, createEmptyContact } from "./data";

// CSSの読み込み
import appStylesHref from "./app.css?url";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// // Loader関数！！！！！
// // データを取得してサイドバーに表示
// export const loader = async () => {
//   const contacts = await getContacts();
//   return json({ contacts });
// };

// Loader関数その２！！！！！
// データを取得してサイドバーに表示、検索機能追加
// 「http://localhost:5173/?q=anderson」みたいなurlからgetContactsする
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

// Action関数！！！！！
// Newボタンは（特殊な）Formタグで囲まれているので、押されたら自動でここのAction関数が呼ばれる
// そして、Action関数が完了するとLoader関数が再検証される仕組みに、もうRemixがなっている！
// なので勝手にサイドバーも更新される
export const action = async() => {
  const contact = await createEmptyContact();
  // Newボタンを押したら自動で編集画面にリダイレクト
  return redirect(`/contacts/${contact.id}/edit`);
};


export default function App() {
  // Loader関数で読み込んだデータの利用！！！！！
  const { contacts, q } = useLoaderData<typeof loader>();
  // Navigationの管理。読み込み中の細かい挙動を制御
  const navigation = useNavigation();
  // 検索をリアルタイム反映
  const submit = useSubmit();
  // 検索中のグルグルを追加
  const searching =
    // navigation.locationは「次にどこに行こうとしているか」
    // 通常この値はundefinedだが読み込み中にはtrueになる
    // q=が入ったURLに飛ぼうとしているときに後半もtrueになる（多分そういうこと）
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );

  // 検索窓から消えちゃう問題解消。難度が高い
  // * useEffectは、関数と依存配列、二つの引数をとる
  // useEffect( ( ) => { }, [ ] );
  // * 依存配列に変更があった時だけ、関数が実行される！
  useEffect (()=>{
    const searchField = document.getElementById("q");
    if(searchField instanceof HTMLInputElement){
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id="search-form"
              role="search"
              // 検索窓の入力内容をリアルタイム反映
              onChange={(event) => {
                // 履歴が溜まらないように
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                });
                submit(event.currentTarget)
              }
              }
            >
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search!!"
                type="search"
                name="q"
                // defaultValueを、useLoaderDataで取得したq（検索窓の入力内容）があればそれに！
                defaultValue={q || ""}
                // 検索中のグルグルを追加。q=が入ったURLに飛ぼうとしているときにsearchingはtrueになる
                className={searching ? "loading" : ""}
              />
              <div
                id="search-spinner"
                aria-hidden
                hidden={!searching}
              />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {/* Loader関数でとってきたデータcontactsを使う */}
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    {/* Navlink toのURLにいるとき、isActiveはtrueになる。
                    Navlink toのURLに行こうと読み込み中のとき、isPendingがtrueになる。 */}
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive
                          ? "active"
                          : isPending
                          ? "pending"
                          : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          // useNavigationで状態を管理することで読み込み中の細かい挙動をいい感じにする
          // このdivはOutletの、つまり連絡先表示部分全てにかかるdiv
          className={
            // searchingは、検索結果を表示しようとしてるときにtrueになるやつ
            navigation.state === "loading" && !searching
              ? "loading" 
              : ""
          }
          id="detail"
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

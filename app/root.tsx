import { json, redirect } from "@remix-run/node";
// CSSの読み込み
import type { LinksFunction } from "@remix-run/node";

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
} from "@remix-run/react";

// Loader関数とAction関数
import { getContacts, createEmptyContact } from "./data";

// CSSの読み込み
import appStylesHref from "./app.css?url";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// Loader関数！！！！！
// データを取得してサイドバーに表示
export const loader = async () => {
  const contacts = await getContacts();
  return json({ contacts });
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
  const { contacts } = useLoaderData<typeof loader>();
  // Navigationの管理。読み込み中の細かい挙動を制御
  const navigation = useNavigation();

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
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search!!"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={true} />
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
            navigation.state === "loading" ? "loading" : ""
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

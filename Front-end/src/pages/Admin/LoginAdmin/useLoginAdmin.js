import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../features/auth/authSlice";
import { setOffre } from "../../../features/admin/offre/offreSlice";
// import { setPanier } from "../../../features/panier/panierSlice";
// import { setCommande } from "../../../features/commande/commandeSlice";
import axios from "axios";

const useLogin = () => {
  const [userInfo, setuserInfo] = useState({
    email: "",
    password: "",
  });
  const [errorInput, seterrorInput] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setisLoading] = useState(false);
  const [isError, setisError] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const user = useSelector((state) => state.auth);

  // si l'utilisateur est déja connecté, il est redirecter vers la page d'accueil
  useEffect(() => {
    if (user?.roles?.some((e) => e.name === "ROLE_ADMIN"))
      return navigate(from);
  }, [user, navigate]);

  // valide le formulaire de connexion
  const validate = () => {
    //validate input
    let error = {};

    if (userInfo.email === "") {
      //validate email
      error.email = "Email is required";
    }
    if (userInfo.password === "") {
      //validate password
      error.password = "Password is required";
    }
    seterrorInput(error);
    return error;
  };

  // submit de formulaire pour la connexion
  const onSubmit = (e) => {
    e.preventDefault();
    setisError(false);
    const error = validate();

    if (Object.keys(error).length !== 0) {
      return;
    }
    login();
  };

  // login user and get his data
  const login = async () => {
    setisLoading(true);
    try {
      const res = await axios.post("/api/login", userInfo);
      console.log(res);
      localStorage.setItem("token", res.data.access_token);
      const config = {
        headers: {
          Authorization: `Bearer ${res.data.access_token}`,
        },
      };

      let user = await axios.get("/api/user/getMe", config);

      user = user.data;
      if (!user.roles.some((e) => e.name === "ROLE_ADMIN"))
        return setisError("Vous n'avez pas les droits d'administrateur");
      console.log(user);
      dispatch(setUser(user));
      // dispatch(setOffre(user.offres));
      // dispatch(setPanier(user.produitPaniers));
      // dispatch(setCommande(user.commandes));
      navigate(from, { replace: true });
    } catch (err) {
      setisError(err.response.data.error);
    } finally {
      setisLoading(false);
    }
  };

  // handle le changement des inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setuserInfo((userInfo) => ({ ...userInfo, [name]: value }));
  };

  return { userInfo, errorInput, isLoading, isError, handleChange, onSubmit };
};

export default useLogin;

import axios from "axios";

const generete = async (req:any, res:any) => {
  try {

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send({
        success: false,
        error: "Please Provide Required Prompt!"
      });
    }

    const response = await axios.post(
      "http://127.0.0.1:8000/api/v1/content/generateReminder",
      {
        prompt
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // Check API success
    if (
      !response.data ||
      response.data.success === false
    ) {
      throw new Error(
        response?.data?.message ||
        response?.data?.error ||
        "Failed To Generate Reminder Email"
      );
    }

    return res.status(200).send({
      success: true,
      data: response.data.response
    });

  } catch (error:any) {
    console.log("cccc",error)

    return res.status(400).send({
      success: false,
      error:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        "Some Error Occurred While Generating Email!"
    });

  }
};

export { generete };
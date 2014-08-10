function modalHttpError(data, status, header, config) {
    var modal = $("#errormodal");
    modal.find(".modal-body").text("Error: " + data.message);
    modal.modal({show: true});
}
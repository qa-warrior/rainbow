//
//  TransactionListView.swift
//  Rainbow
//
//  Created by Alexey Kureev on 28/12/2019.
//

import Foundation

class TransitionListTableView: UITableView {
  override func touchesShouldCancel(in view: UIView) -> Bool {
    return true
  }
}

class TransactionListView: UIView, UITableViewDelegate, UITableViewDataSource {
  @objc var onTransactionPress: RCTBubblingEventBlock = { _ in }
  @objc var onRequestPress: RCTBubblingEventBlock = { _ in }
  @objc var onRequestExpire: RCTBubblingEventBlock = { _ in }
  @objc var onReceivePress: RCTBubblingEventBlock = { _ in }
  @objc var onCopyAddressPress: RCTBubblingEventBlock = { _ in }
  @objc var onCopyTooltipPress: RCTBubblingEventBlock = { _ in }
  @objc var onAvatarPress: RCTBubblingEventBlock = { _ in }
  @objc var onAddCashPress: RCTBubblingEventBlock = { _ in }
  @objc var addCashAvailable: Bool = true {
    didSet {
      header.addCash.isHidden = addCashAvailable
      header.addCash.isHidden = !addCashAvailable
      header.frame.size.height = addCashAvailable ? 260 : 185
      headerSeparator.frame.origin.y = header.frame.size.height - 2
    }
  }
  @objc var isAvatarPickerAvailable: Bool = true {
    didSet {
      header.avatarView.isHidden = isAvatarPickerAvailable
      header.accountView.isHidden = !isAvatarPickerAvailable
    }
  }
  @objc var scaleTo: CGFloat = 0.97
  @objc var transformOrigin: CGPoint = CGPoint(x: 0.5, y: 0.5)
  @objc var enableHapticFeedback: Bool = true
  @objc var hapticType: String = "selection"
  @objc var scrollToTopDelay: TimeInterval = 0.2
  @objc var accountAddress: String? = nil {
    didSet {
      header.accountAddress.text = accountAddress
      header.accountAddress.addCharacterSpacing(kernValue: 0.5)
    }
  }
  @objc var accountColor: UIColor? = nil {
    didSet {
      header.accountBackground.backgroundColor = accountColor
      shadowLayer.shadowColor = accountColor?.cgColor
    }
  }
  @objc var accountName: String? = nil {
    didSet {
      header.accountName.text = accountName
    }
  }
  @objc var data: TransactionData = TransactionData() {
    didSet {
      let transactions = data.value(forKey: "transactions") as! [Transaction]
      let requests = data.value(forKey: "requests") as! [TransactionRequest]
      var items = [TransactionViewModelProtocol]()
      
      if !requests.isEmpty {
        let item = TransactionViewModelTransactionRequestItem(requests: requests)
        items.append(item)
      }
      
      if !transactions.isEmpty {
        let item = TransactionViewModelTransactionItem(transactions: transactions)
        items.append(item)
      }
      
      sections = items.flatMap { $0.sections }
      tableView.reloadData()
    }
  }
  @objc func onAvatarPressed(_ sender: UIButton) {
    tableView.setContentOffset(.zero, animated: true)
    if tableView.contentOffset.y == CGFloat(0) {
      self.onAvatarPress([:])
    } else {
      DispatchQueue.main.asyncAfter(deadline: .now() + scrollToTopDelay) {
        self.onAvatarPress([:])
      }
    }
  }
  @objc func onPressInAvatar(_ sender: UIButton) {
    header.accountView.animateTapStart(scale: 0.9)
  }
  @objc func onPressOutAvatar(_ sender: UIButton) {
    header.accountView.animateTapEnd(useHaptic: "selection")
  }
  
  @objc func onAccountAddressPressed(_ sender: UITapGestureRecognizer) {
    
    if let senderView = sender.view {
      senderView.becomeFirstResponder()
      
      let copyMenuItem = UIMenuItem(title: "Copy", action: #selector(onCopyTooltipPressed))
      UIMenuController.shared.menuItems = [copyMenuItem]
      UIMenuController.shared.setTargetRect(senderView.frame, in: header)
      UIMenuController.shared.setMenuVisible(true, animated: true)
    }
  }
  
  @objc func onCopyTooltipPressed() {
    header.accountAddress.resignFirstResponder()
    self.onCopyTooltipPress(nil);
  }
  
  @objc func onCopyAddressPressed(_ sender: UIButton) {
    let rect = sender.convert(sender.frame, to: self)
    self.onCopyAddressPress([
      "x": rect.origin.x,
      "y": rect.origin.y,
      "width": sender.frame.width,
      "height": sender.frame.height
    ])
  }
  
  @objc func onPressInCopyAddress(_ sender: UIButton) {
    header.copyAddress.animateTapStart(scale: 0.86)
  }
  @objc func onPressOutCopyAddress(_ sender: UIButton) {
    header.copyAddress.animateTapEnd(useHaptic: "selection")
  }

  @objc func onReceivePressed(_ sender: UIButton) {
    self.onReceivePress([:])
  }
  @objc func onPressInReceive(_ sender: UIButton) {
    header.receive.animateTapStart(scale: 0.86)
  }
  @objc func onPressOutReceive(_ sender: UIButton) {
    header.receive.animateTapEnd(useHaptic: "selection")
  }
  
  @objc func onAddCashPressed(_ sender: UIButton) {
    self.onAddCashPress([:])
  }
  @objc func onPressInAddCash(_ sender: UIButton) {
    header.addCash.animateTapStart(scale: 0.9)
  }
  @objc func onPressOutAddCash(_ sender: UIButton) {
    header.addCash.animateTapEnd(useHaptic: "selection")
  }
  
  var sections: [TransactionSectionProtocol] = [TransactionSectionProtocol]()
  
  let tableView = TransitionListTableView()
  let header: TransactionListViewHeader = TransactionListViewHeader.fromNib()
  let headerSeparator = UIView()
  let shadowLayer = CAShapeLayer()
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    
    tableView.dataSource = self
    tableView.delegate = self
    tableView.rowHeight = 70
    tableView.delaysContentTouches = false
    tableView.separatorStyle = .none
    tableView.register(UINib(nibName: "TransactionListViewCell", bundle: nil), forCellReuseIdentifier: "TransactionListViewCell")
    tableView.register(UINib(nibName: "TransactionListRequestViewCell", bundle: nil), forCellReuseIdentifier: "TransactionListRequestViewCell")
    tableView.canCancelContentTouches = true
    tableView.scrollIndicatorInsets.bottom = 0.0000000001
    
    header.addSubview(headerSeparator)
    
    header.accountView.addTarget(self, action: #selector(onAvatarPressed(_:)), for: .touchUpInside)
    header.accountView.addTarget(self, action: #selector(onPressInAvatar(_:)), for: .touchDown)
    header.accountView.addTarget(self, action: #selector(onPressInAvatar(_:)), for: .touchDragInside)
    header.accountView.addTarget(self, action: #selector(onPressOutAvatar(_:)), for: .touchUpInside)
    header.accountView.addTarget(self, action: #selector(onPressOutAvatar(_:)), for: .touchDragOutside)
    header.accountView.addTarget(self, action: #selector(onPressOutAvatar(_:)), for: .touchCancel)
    header.accountView.addTarget(self, action: #selector(onPressOutAvatar(_:)), for: .touchUpOutside)
    
    header.accountAddress.becomeFirstResponder();
    let pressGR = UITapGestureRecognizer(target: self, action: #selector(onAccountAddressPressed))
    header.accountAddress.isUserInteractionEnabled = true
    header.accountAddress.addGestureRecognizer(pressGR)
    
    header.copyAddress.addTarget(self, action: #selector(onCopyAddressPressed(_:)), for: .touchUpInside)
    header.copyAddress.addTarget(self, action: #selector(onPressInCopyAddress(_:)), for: .touchDown)
    header.copyAddress.addTarget(self, action: #selector(onPressInCopyAddress(_:)), for: .touchDragInside)
    header.copyAddress.addTarget(self, action: #selector(onPressOutCopyAddress(_:)), for: .touchUpInside)
    header.copyAddress.addTarget(self, action: #selector(onPressOutCopyAddress(_:)), for: .touchDragOutside)
    header.copyAddress.addTarget(self, action: #selector(onPressOutCopyAddress(_:)), for: .touchCancel)
    header.copyAddress.addTarget(self, action: #selector(onPressOutCopyAddress(_:)), for: .touchUpOutside)
    
    header.receive.addTarget(self, action: #selector(onReceivePressed(_:)), for: .touchUpInside)
    header.receive.addTarget(self, action: #selector(onPressInReceive(_:)), for: .touchDown)
    header.receive.addTarget(self, action: #selector(onPressInReceive(_:)), for: .touchDragInside)
    header.receive.addTarget(self, action: #selector(onPressOutReceive(_:)), for: .touchUpInside)
    header.receive.addTarget(self, action: #selector(onPressOutReceive(_:)), for: .touchDragOutside)
    header.receive.addTarget(self, action: #selector(onPressOutReceive(_:)), for: .touchCancel)
    header.receive.addTarget(self, action: #selector(onPressOutReceive(_:)), for: .touchUpOutside)
    
    header.addCash.addTarget(self, action: #selector(onAddCashPressed(_:)), for: .touchUpInside)
    header.addCash.addTarget(self, action: #selector(onPressInAddCash(_:)), for: .touchDown)
    header.addCash.addTarget(self, action: #selector(onPressInAddCash(_:)), for: .touchDragInside)
    header.addCash.addTarget(self, action: #selector(onPressOutAddCash(_:)), for: .touchUpInside)
    header.addCash.addTarget(self, action: #selector(onPressOutAddCash(_:)), for: .touchDragOutside)
    header.addCash.addTarget(self, action: #selector(onPressOutAddCash(_:)), for: .touchCancel)
    header.addCash.addTarget(self, action: #selector(onPressOutAddCash(_:)), for: .touchUpOutside)
    
    header.copyAddress.titleLabel?.addCharacterSpacing(kernValue: 0.5)
    header.receive.titleLabel?.addCharacterSpacing(kernValue: 0.5)
    header.addCashLabel.titleLabel?.textAlignment = .center
    header.addCashLabel.titleLabel?.addCharacterSpacing(kernValue: 0.4)
    
    let secondShadowLayer = CAShapeLayer()
    let radius = header.accountBackground.frame.width / 2.0
    let circle = UIBezierPath(arcCenter: header.accountBackground.center, radius: radius, startAngle: 0, endAngle: 2 * CGFloat.pi, clockwise: true)

    shadowLayer.shadowOffset = CGSize(width: 0, height: 6)
    shadowLayer.shadowOpacity = 0.25
    shadowLayer.shadowPath = circle.cgPath
    shadowLayer.shadowRadius = 5
    shadowLayer.zPosition = -1

    secondShadowLayer.shadowColor = UIColor.RainbowTheme.Transactions.dark.cgColor
    secondShadowLayer.shadowOffset = CGSize(width: 0, height: 2)
    secondShadowLayer.shadowOpacity = 0.2
    secondShadowLayer.shadowPath = circle.cgPath
    secondShadowLayer.shadowRadius = 2.5
    secondShadowLayer.zPosition = -2

    header.accountView.layer.addSublayer(shadowLayer)
    header.accountView.layer.addSublayer(secondShadowLayer)
    
    headerSeparator.backgroundColor = UIColor.RainbowTheme.Transactions.rowDividerLight
    tableView.tableHeaderView = header
    addSubview(tableView)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  /// React Native is known to re-render only first-level subviews. Since our tableView is a custom view that we add as a second-level subview, we need to relayout it manually
  override func layoutSubviews() {
    tableView.frame = self.bounds
    header.frame = CGRect(x: 0, y: 0, width: tableView.bounds.width, height: addCashAvailable ? 260 : 185)
    headerSeparator.frame = CGRect(x: 19, y: header.frame.size.height - 2, width: tableView.bounds.width - 19, height: 2)
    headerSeparator.roundLeftCorners()
  }
  
  func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
    return 57
  }
  
  func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
    let view = UIView(frame: CGRect(x: 0, y: 0, width: frame.width, height: 40))
    let label = UILabel(frame: CGRect(x: 19, y: 19, width: view.frame.width, height: view.frame.height))
    
    if sections.count == 0 {
      return nil
    }
    
    let section = sections[section]
    
    label.text = section.title
    label.font = UIFont(name: "SFRounded-Bold", size: 20)
    label.textColor = UIColor.RainbowTheme.Transactions.dark
    label.addCharacterSpacing()
    view.backgroundColor = .white
    view.addSubview(label)
    
    return view
  }
  
  func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
    let item = sections[indexPath.section]
    
    if item.type == .transactions {
      let section = sections[indexPath.section]
      
      if section.data.indices.contains(indexPath.row + 1) {
        let nextTransaction = section.data[indexPath.row + 1] as! Transaction
        if nextTransaction.isSwapped() {
          return 52.0
        }
      }
    }
    
    return 70.0
  }
  
  func numberOfSections(in tableView: UITableView) -> Int {
    return sections.count
  }
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    if sections.count == 0 {
      return 0
    }
    return sections[section].data.count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let item = sections[indexPath.section]
    
    if item.type == .transactions {
      let cell = tableView.dequeueReusableCell(withIdentifier: "TransactionListViewCell", for: indexPath) as! TransactionListViewCell
      let transaction = sections[indexPath.section].data[indexPath.row] as! Transaction
      
      cell.onItemPress = onTransactionPress
      cell.layer.anchorPoint = transformOrigin
      cell.row = indexPath.row
      cell.scaleTo = scaleTo
      cell.set(transaction: transaction)
      cell.selectionStyle = .none
      
      return cell;
    } else {
      let cell = tableView.dequeueReusableCell(withIdentifier: "TransactionListRequestViewCell", for: indexPath) as! TransactionListRequestViewCell
      let request = sections[indexPath.section].data[indexPath.row] as! TransactionRequest
      
      cell.onItemPress = onRequestPress
      cell.layer.anchorPoint = transformOrigin
      cell.onRequestExpire = onRequestExpire
      cell.row = indexPath.row
      cell.scaleTo = scaleTo
      cell.set(request: request)
      cell.selectionStyle = .none
      
      return cell;
    }
  }
}
